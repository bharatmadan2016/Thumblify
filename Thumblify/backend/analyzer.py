import cv2
import numpy as np
import sys
import json
import os


# ---------------- NORMALIZATION ---------------- #
def normalize(value, min_val, max_val):
    if max_val - min_val == 0:
        return 0
    return (value - min_val) / (max_val - min_val)


def clamp(val, min_val=0.0, max_val=1.0):
    return max(min_val, min(val, max_val))


# ---------------- SCORING FUNCTION ---------------- #
def score_thumbnail(brightness, contrast, edge_density, colorfulness):

    # Normalize features (safe ranges)
    brightness_norm = clamp(normalize(brightness, 70, 180))
    contrast_norm = clamp(normalize(contrast, 20, 120))
    edge_norm = clamp(normalize(edge_density, 1, 15))
    color_norm = clamp(normalize(colorfulness, 10, 120))

    # Brightness best at mid (not too dark, not too bright)
    brightness_score = 1 - abs(brightness_norm - 0.5) * 2
    brightness_score = clamp(brightness_score)

    # Weighted score
    final_score = (
        brightness_score * 0.2 +
        contrast_norm * 0.3 +
        edge_norm * 0.2 +
        color_norm * 0.3
    )

    # Clamp final score (IMPORTANT)
    final_score = clamp(final_score, 0.05, 1)

    return final_score


# ---------------- MAIN FUNCTION ---------------- #
def estimate_ctr(image_path):

    if not os.path.exists(image_path):
        return {"error": "Image file not found"}

    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Could not read image"}

    # Resize for consistency
    img = cv2.resize(img, (640, 360))

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 1. Brightness
    brightness = np.mean(gray)

    # 2. Contrast
    contrast = np.std(gray)

    # 3. Edge Density (improved thresholds)
    edges = cv2.Canny(gray, 50, 150)
    edge_density = (np.sum(edges > 0) / edges.size) * 100

    # 4. Colorfulness
    (B, G, R) = cv2.split(img.astype("float"))
    rg = np.abs(R - G)
    yb = np.abs(0.5 * (R + G) - B)

    rbMean, rbStd = np.mean(rg), np.std(rg)
    ybMean, ybStd = np.mean(yb), np.std(yb)

    stdRoot = np.sqrt((rbStd ** 2) + (ybStd ** 2))
    meanRoot = np.sqrt((rbMean ** 2) + (ybMean ** 2))
    colorfulness = stdRoot + (0.3 * meanRoot)

    # ---------------- SCORING ---------------- #
    final_score = score_thumbnail(brightness, contrast, edge_density, colorfulness)

    # CTR Calculation (stable range)
    ctr_percentage = 3 + (final_score * 9)   # 3% → 12%
    ctr_percentage = max(1.5, ctr_percentage)

    # Baseline comparison
    baseline_ctr = 5.0
    performance = ctr_percentage - baseline_ctr

    # Quality classification
    if final_score < 0.4:
        quality = "Poor"
    elif final_score < 0.7:
        quality = "Average"
    else:
        quality = "High"

    return {
        "ctr_score": round(ctr_percentage, 2),
        "quality": quality,
        "performance_vs_avg": round(performance, 2),
        "metrics": {
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "edge_density": round(edge_density, 2),
            "colorfulness": round(colorfulness, 2)
        }
    }


# ---------------- CLI ENTRY ---------------- #
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
    else:
        path = sys.argv[1]
        result = estimate_ctr(path)
        print(json.dumps(result))
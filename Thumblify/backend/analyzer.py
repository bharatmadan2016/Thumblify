import cv2
import numpy as np
import sys
import json
import os

def estimate_ctr(image_path):
    if not os.path.exists(image_path):
        return {"error": "Image file not found"}

    # Load image
    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Could not read image"}

    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 1. Brightness (Mean intensity)
    brightness = np.mean(gray)
    
    # 2. Contrast (Standard deviation)
    contrast = np.std(gray)

    # 3. Edge Density (Visual Complexity)
    edges = cv2.Canny(gray, 100, 200)
    edge_density = (np.sum(edges > 0) / edges.size) * 100

    # 4. Colorfulness (Hasler and Suesstrunk metric)
    (B, G, R) = cv2.split(img.astype("float"))
    rg = np.absolute(R - G)
    yb = np.absolute(0.5 * (R + G) - B)
    (rbMean, rbStd) = (np.mean(rg), np.std(rg))
    (ybMean, ybStd) = (np.mean(yb), np.std(yb))
    stdRoot = np.sqrt((rbStd ** 2) + (ybStd ** 2))
    meanRoot = np.sqrt((rbMean ** 2) + (ybMean ** 2))
    colorfulness = stdRoot + (0.3 * meanRoot)

    # Heuristic CTR score calculation (Mock logic)
    # Brightness: Ideally balanced (40-80 range)
    # Contrast: Higher is generally better for thumbnails
    # Edge density: Moderate complexity is good
    # Colorfulness: Higher is generally better for clicks
    
    score = (contrast * 0.4) + (colorfulness * 0.3) + (edge_density * 2) + (brightness * 0.1)
    
    # Normalize to 0-10 range for CTR percentage estimation (purely heuristic)
    ctr_percentage = min(max(score / 15, 1.2), 12.5) # Caps between 1.2% and 12.5%

    return {
        "ctr_score": round(ctr_percentage, 2),
        "metrics": {
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "edge_density": round(edge_density, 2),
            "colorfulness": round(colorfulness, 2)
        }
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
    else:
        path = sys.argv[1]
        result = estimate_ctr(path)
        print(json.dumps(result))

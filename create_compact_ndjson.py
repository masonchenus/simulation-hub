import re
import json
import os

INPUT_FILE = 'critical/brainwave-suite.html'
OUTPUT_FILE = 'binaural-presets-compact.ndjson'

def generate_dynamic_presets():
    presets = []

    # energyPresets
    for i in range(280):
        freq = 18 + i * 0.2
        is_gamma = freq >= 30
        presets.append({
            "name": f"Energy Boost {i + 1}",
            "freq": round(freq, 2),
            "mode": "gamma" if is_gamma else "beta"
        })

    # sleepPresets
    for i in range(115):
        presets.append({
            "name": f"Sleep Mode {i + 1}",
            "freq": round(1 + i * 0.2, 2),
            "mode": "sleep"
        })

    # subDeltaPresets
    for i in range(10):
        presets.append({
            "name": f"Sub-Delta {i + 1}",
            "freq": round(0.1 + i * 0.1, 2),
            "mode": "subdelta"
        })

    # relaxPresets
    for i in range(45):
        presets.append({
            "name": f"Relax Mode {i + 1}",
            "freq": round(6 + i * 0.15, 2),
            "mode": "relax"
        })

    # thetaPresets
    for i in range(60):
        presets.append({
            "name": f"Theta Mode {i + 1}",
            "freq": round(4 + i * 0.1, 2),
            "mode": "theta"
        })

    # betaPresets
    for i in range(70):
        presets.append({
            "name": f"Beta Mode {i + 1}",
            "freq": round(12 + i * 0.2, 2),
            "mode": "beta"
        })

    # highHzPresets
    for i in range(300):
        freq = 60 + i * 3
        presets.append({
            "name": f"High Hertz {i + 1}",
            "freq": round(freq, 2),
            "mode": "gamma" if i % 2 == 0 else "highgamma"
        })

    # alphaPresets
    for i in range(30):
        presets.append({
            "name": f"Alpha Mode {i + 1}",
            "freq": round(8 + i * 0.15, 2),
            "mode": "relax"
        })

    # focusPresets
    for i in range(40):
        presets.append({
            "name": f"Focus Mode {i + 1}",
            "freq": round(14 + i * 0.25, 2),
            "mode": "beta"
        })

    # extraPresets
    for i in range(100):
        if i < 25:
            freq = 0.5 + (i * 0.3)
            mode = "sleep" if freq < 4 else "theta"
            name = f"Deep Dive {i + 1}"
        elif i < 50:
            freq = 8 + ((i - 25) * 0.25)
            mode = "relax"
            name = f"Calm State {i - 24}"
        elif i < 75:
            freq = 14.5 + ((i - 50) * 0.6)
            mode = "beta"
            name = f"Active Mind {i - 49}"
        else:
            freq = 32 + ((i - 75) * 2.0)
            mode = "gamma" if freq > 40 else "beta"
            if freq > 80:
                mode = "highgamma"
            name = f"Hyper Sync {i - 74}"
        
        presets.append({
            "name": name,
            "freq": round(freq, 2),
            "mode": mode
        })

    return presets

def extract_static_presets(html_content):
    presets = []
    # Find all variable definitions like: const name = [ ... ];
    matches = re.finditer(r'const\s+(\w+)\s*=\s*\[([\s\S]*?)\];', html_content)
    
    for match in matches:
        var_name = match.group(1)
        if var_name == 'monauralMixPresets':
            continue

        content = match.group(2)
        # Skip if it looks like a generated array
        if 'Array.from' in content: 
            continue

        # Extract objects inside the array
        object_matches = re.finditer(r'\{([\s\S]*?)\}', content)
        for obj_match in object_matches:
            obj_str = obj_match.group(1)
            
            name_m = re.search(r'name:\s*"([^"]+)"', obj_str)
            freq_m = re.search(r'freq:\s*([\d.]+)', obj_str)
            mode_m = re.search(r'mode:\s*"([^"]+)"', obj_str)
            
            if name_m and freq_m and mode_m:
                presets.append({
                    "name": name_m.group(1),
                    "freq": float(freq_m.group(1)),
                    "mode": mode_m.group(1)
                })
                
    return presets

def main():
    print(f"Processing {INPUT_FILE}...")
    try:
        with open(INPUT_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"Error: {INPUT_FILE} not found.")
        return

    static_presets = extract_static_presets(content)
    dynamic_presets = generate_dynamic_presets()
    
    all_presets = static_presets + dynamic_presets
    
    # Deduplicate by name
    seen = set()
    unique_presets = []
    for p in all_presets:
        if p['name'] not in seen:
            seen.add(p['name'])
            unique_presets.append(p)
            
    print(f"Found {len(unique_presets)} presets.")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        for p in unique_presets:
            f.write(json.dumps(p) + '\n')
            
    print(f"Created {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
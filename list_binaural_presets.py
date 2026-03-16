#!/usr/bin/env python3
import json
import os

def list_presets():
    """
    Reads the binaural presets ndjson file and saves a simplified list
    containing only the name, frequency, and mode for each preset to a file.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    presets_file = os.path.join(script_dir, 'binaural-presets.presets.ndjson')
    output_file = os.path.join(script_dir, 'binaural_presets_list.txt')

    output_lines = []
    try:
        with open(presets_file, 'r') as f:
            for line in f:
                if line.strip():
                    preset = json.loads(line)
                    output_lines.append(f"Name: {preset['name']}, Freq: {preset['freq']}, Mode: {preset['mode']}")
    except FileNotFoundError:
        print(f"Error: Could not find the presets file at {presets_file}")
        return

    try:
        with open(output_file, 'w') as f:
            f.write('\n'.join(output_lines) + '\n')
        print(f"Successfully saved preset list to: {output_file}")
    except IOError as e:
        print(f"Error writing to file {output_file}: {e}")

if __name__ == "__main__":
    list_presets()
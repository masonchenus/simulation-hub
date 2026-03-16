#!/usr/bin/env python3
import json
import copy

# Energy Presets: 100 presets
energy_presets = []
for i in range(100):
    freq = 18 + i * 0.4
    is_gamma = freq >= 30
    energy_presets.append({
        'name': f'Energy Boost {i + 1}',
        'freq': round(freq, 1),
        'mode': 'gamma' if is_gamma else 'beta',
        'note': 'Gamma range: Peak focus and cognitive energy.' if is_gamma else 'High Beta: Alertness and active concentration.'
    })

# Sleep Presets: 60 presets
sleep_presets = []
for i in range(60):
    sleep_presets.append({
        'name': f'Sleep Mode {i + 1}',
        'freq': round(1 + i * 0.1, 1),
        'mode': 'sleep',
        'note': 'Slow delta support.'
    })

# Sub-Delta Presets: 20 presets
subdelta_presets = []
for i in range(20):
    subdelta_presets.append({
        'name': f'Sub-Delta {i + 1}',
        'freq': round(0.2 + i * 0.04, 2),
        'mode': 'subdelta',
        'note': 'Ultra-low sub-delta.'
    })

# Relax Presets: 40 presets
relax_presets = []
for i in range(40):
    relax_presets.append({
        'name': f'Relax Mode {i + 1}',
        'freq': round(6 + i * 0.2, 1),
        'mode': 'relax',
        'note': 'Soft alpha/theta blend.'
    })

# Theta Presets: 40 presets
theta_presets = []
for i in range(40):
    theta_presets.append({
        'name': f'Theta Mode {i + 1}',
        'freq': round(4 + i * 0.15, 2),
        'mode': 'theta',
        'note': 'Theta dreamy focus.'
    })

# Beta Presets: 55 presets
beta_presets = []
for i in range(55):
    beta_presets.append({
        'name': f'Beta Mode {i + 1}',
        'freq': round(12 + i * 0.3, 1),
        'mode': 'beta',
        'note': 'Beta alertness and clarity.'
    })

# HighHz Presets: 200 presets
highhz_presets = []
for i in range(200):
    highhz_presets.append({
        'name': f'High Hertz {i + 1}',
        'freq': round(60 + i * 3.5, 1),
        'mode': 'highgamma' if i % 2 == 1 else 'gamma',
        'note': 'Ultra-high hertz stimulation.'
    })

# Add specific experimental high frequency
highhz_presets.append({
    'name': 'Experimental 957 Hz',
    'freq': 957.0,
    'mode': 'highgamma',
    'note': 'Pineal activation & spiritual connection.'
})

# Alpha Presets: 30 presets
alpha_presets = []
for i in range(30):
    alpha_presets.append({
        'name': f'Alpha Mode {i + 1}',
        'freq': round(8 + i * 0.15, 2),
        'mode': 'relax',
        'note': 'Alpha calm and clarity.'
    })

# Focus Presets: 40 presets
focus_presets = []
for i in range(40):
    focus_presets.append({
        'name': f'Focus Mode {i + 1}',
        'freq': round(14 + i * 0.25, 2),
        'mode': 'beta',
        'note': 'Focused beta pacing.'
    })

# Extra Presets: 100 presets
extra_presets = []
for i in range(100):
    if i < 25:
        freq = 0.5 + (i * 0.3)
        mode = 'sleep' if freq < 4 else 'theta'
        name = f'Deep Dive {i + 1}'
    elif i < 50:
        freq = 8 + ((i - 25) * 0.25)
        mode = 'relax'
        name = f'Calm State {i - 24}'
    elif i < 75:
        freq = 14.5 + ((i - 50) * 0.6)
        mode = 'beta'
        name = f'Active Mind {i - 49}'
    else:
        freq = 32 + ((i - 75) * 2.0)
        mode = 'beta'
        if freq > 80:
            mode = 'highgamma'
        elif freq > 40:
            mode = 'gamma'
        name = f'Hyper Sync {i - 74}'
    extra_presets.append({
        'name': name,
        'freq': round(freq, 2),
        'mode': mode,
        'note': 'Extended range preset.'
    })

# Load and update
with open('binaural-presets.json', 'r') as f:
    data = json.load(f)

def update_cat(key, presets, desc="Generated presets"):
    if key not in data['categories']:
        data['categories'][key] = {'description': desc, 'presets': []}
    data['categories'][key]['presets'] = presets

update_cat('energyPresets', energy_presets)
update_cat('sleepPresets', sleep_presets)
update_cat('subDeltaPresets', subdelta_presets)
update_cat('relaxPresets', relax_presets)
update_cat('thetaPresets', theta_presets)
update_cat('betaPresets', beta_presets)
update_cat('highHzPresets', highhz_presets)
update_cat('alphaPresets', alpha_presets)
update_cat('focusPresets', focus_presets)
update_cat('extraPresets', extra_presets, "Extended range presets")

total = sum(len(cat['presets']) for cat in data['categories'].values())
data['summary']['totalPresets'] = total

# Save detailed version
with open('binaural-presets-detailed.json', 'w') as f:
    json.dump(data, f, indent=2)

# Create compact version
compact_data = copy.deepcopy(data)
allowed_keys = {'name', 'freq', 'mode', 'note'}

for cat in compact_data['categories'].values():
    if 'presets' in cat:
        new_presets = []
        for p in cat['presets']:
            new_p = {k: v for k, v in p.items() if k in allowed_keys}
            new_presets.append(new_p)
        cat['presets'] = new_presets

# Custom write to keep presets on single lines
with open('binaural-presets.json', 'w') as f:
    f.write('{\n')
    if 'description' in compact_data:
        f.write(f'  "description": {json.dumps(compact_data["description"])},\n')
    f.write('  "categories": {\n')
    cats = list(compact_data['categories'].items())
    for i, (k, v) in enumerate(cats):
        f.write(f'    "{k}": {{\n')
        f.write(f'      "description": {json.dumps(v["description"])},\n')
        f.write('      "presets": [\n')
        for j, p in enumerate(v['presets']):
            comma = "," if j < len(v['presets']) - 1 else ""
            f.write(f'        {json.dumps(p)}{comma}\n')
        f.write('      ]\n')
        f.write(f'    }}{"," if i < len(cats) - 1 else ""}\n')
    f.write('  },\n')
    f.write('  "summary": ' + json.dumps(compact_data['summary'], indent=2).replace('\n', '\n  '))
    f.write('\n}\n')

print(f'Total presets: {total}')
print('Saved detailed presets to binaural-presets-detailed.json')
print('Saved compact presets to binaural-presets.json')

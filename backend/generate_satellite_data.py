import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import os

# Create directory for fake satellite images
os.makedirs('satellite_images', exist_ok=True)

# Load your fire data
fire_df = pd.read_csv('almora_fake_fire_data.csv')

# Generate fake satellite data for each date
print("Generating fake satellite images...")

for idx, row in fire_df.iterrows():
    date = row['date']
    fire = row['fire_occurred']
    
    # Generate fake NDVI (vegetation index) - 64x64 image
    # Higher values = more vegetation
    ndvi = np.random.uniform(0.3, 0.8, (64, 64))
    
    # If fire occurred, reduce NDVI in a random spot
    if fire == 1:
        x, y = np.random.randint(10, 54, 2)
        ndvi[x-10:x+10, y-10:y+10] *= 0.3  # Burn mark
    
    # Generate fake LST (land surface temperature)
    # Higher temps in fire areas
    lst = np.random.uniform(20, 35, (64, 64))
    if fire == 1:
        lst[x-10:x+10, y-10:y+10] += 15  # Hot spot
    
    # Save as numpy arrays
    np.save(f'satellite_images/ndvi_{date}.npy', ndvi)
    np.save(f'satellite_images/lst_{date}.npy', lst)
    
    if idx % 100 == 0:
        print(f"Processed {idx}/{len(fire_df)} images")

print("Done! Satellite data generated.")

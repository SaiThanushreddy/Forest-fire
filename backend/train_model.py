import numpy as np
import pandas as pd
import os
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import TimeDistributed, Conv2D, MaxPooling2D, Flatten, LSTM, Dense, Reshape
from tensorflow.keras.optimizers import Adam
import matplotlib.pyplot as plt

print("Loading data...")

# Load fire and weather data
fire_df = pd.read_csv('almora_fake_fire_data.csv')
weather_df = pd.read_csv('nasa-power-parameters.csv')

print(f"Loaded {len(fire_df)} days of fire data")

# Load satellite images
print("Loading satellite images...")
dates = fire_df['date'].values
ndvi_list = []
lst_list = []

for i, date in enumerate(dates):
    try:
        ndvi = np.load(f'satellite_images/ndvi_{date}.npy')
        lst = np.load(f'satellite_images/lst_{date}.npy')
        ndvi_list.append(ndvi)
        lst_list.append(lst)
    except:
        pass
    
    if i % 500 == 0:
        print(f"Loaded {i}/{len(dates)} images")

# Stack images (combine NDVI and LST as 2 channels)
images = np.stack([np.array(ndvi_list), np.array(lst_list)], axis=-1)
print(f"Final image shape: {images.shape}")

# Create sequences (5 days → predict 6th day)
print("Creating sequences...")
sequence_length = 5
X, y = [], []

for i in range(len(images) - sequence_length):
    X.append(images[i:i+sequence_length])
    y.append(images[i+sequence_length])

X = np.array(X)
y = np.array(y)

print(f"X shape: {X.shape}")  # Should be (samples, 5, 64, 64, 2)
print(f"y shape: {y.shape}")  # Should be (samples, 64, 64, 2)

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")

# Build CNN-LSTM Model
print("Building model...")

model = Sequential([
    # CNN layers (applied to each time step)
    TimeDistributed(Conv2D(32, (3, 3), activation='relu'), input_shape=(sequence_length, 64, 64, 2)),
    TimeDistributed(MaxPooling2D((2, 2))),
    TimeDistributed(Conv2D(64, (3, 3), activation='relu')),
    TimeDistributed(MaxPooling2D((2, 2))),
    TimeDistributed(Flatten()),
    
    # LSTM layer (temporal learning)
    LSTM(128, return_sequences=False),
    
    # Output layer
    Dense(64 * 64 * 2, activation='sigmoid'),
    Reshape((64, 64, 2))
])

model.compile(optimizer=Adam(learning_rate=0.001), loss='mse', metrics=['mae'])

print(model.summary())

# Train the model
print("Training model...")
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=10,
    batch_size=8,
    verbose=1
)

# Save the model
model.save('almora_fire_model.h5')
print("Model saved as 'almora_fire_model.h5'")

# Plot training history
plt.figure(figsize=(12, 4))

plt.subplot(1, 2, 1)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()

plt.subplot(1, 2, 2)
plt.plot(history.history['mae'], label='Training MAE')
plt.plot(history.history['val_mae'], label='Validation MAE')
plt.title('Model MAE')
plt.xlabel('Epoch')
plt.ylabel('MAE')
plt.legend()

plt.tight_layout()
plt.savefig('training_history.png')
print("Training plot saved as 'training_history.png'")

# Make predictions on test set
print("Making predictions...")
predictions = model.predict(X_test[:5])

# Visualize predictions
fig, axes = plt.subplots(5, 3, figsize=(12, 15))

for i in range(5):
    # Ground truth NDVI
    axes[i, 0].imshow(y_test[i, :, :, 0], cmap='RdYlGn')
    axes[i, 0].set_title(f'True NDVI - Sample {i+1}')
    axes[i, 0].axis('off')
    
    # Predicted NDVI
    axes[i, 1].imshow(predictions[i, :, :, 0], cmap='RdYlGn')
    axes[i, 1].set_title(f'Predicted NDVI - Sample {i+1}')
    axes[i, 1].axis('off')
    
    # Ground truth LST
    axes[i, 2].imshow(y_test[i, :, :, 1], cmap='hot')
    axes[i, 2].set_title(f'True LST - Sample {i+1}')
    axes[i, 2].axis('off')

plt.tight_layout()
plt.savefig('predictions.png')
print("Predictions saved as 'predictions.png'")

print("\n✅ Training complete!")
print("Files created:")
print("  - almora_fire_model.h5 (trained model)")
print("  - training_history.png (loss curves)")
print("  - predictions.png (sample predictions)")


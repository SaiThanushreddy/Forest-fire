#!/usr/bin/env python3
"""
CNN-LSTM Fire Prediction Model Trainer
Almora Forest Fire Prediction System
"""

import numpy as np
import pandas as pd
import os
import json
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import (
    TimeDistributed, Conv2D, MaxPooling2D, Flatten,
    LSTM, Dense, Reshape, Dropout, BatchNormalization,
    Input, Concatenate
)
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt

# Configuration
SEQUENCE_LENGTH = 5
IMAGE_SIZE = 64
BATCH_SIZE = 8
EPOCHS = 10
MODEL_PATH = 'models/almora_fire_model.keras'

def load_fire_data():
    """Load fire occurrence data"""
    print("Loading fire data...")
    fire_df = pd.read_csv('almora_fake_fire_data.csv')
    fire_df['date'] = pd.to_datetime(fire_df['date'])
    print(f"  Loaded {len(fire_df)} days of fire data")
    print(f"  Fire occurrences: {fire_df['fire_occurred'].sum()}")
    return fire_df

def load_satellite_images(dates):
    """Load NDVI and LST satellite images"""
    print("Loading satellite images...")
    ndvi_list = []
    lst_list = []
    valid_dates = []

    for i, date in enumerate(dates):
        # Handle different date formats
        if hasattr(date, 'strftime'):
            date_str = date.strftime('%Y-%m-%d')
        elif hasattr(date, 'astype'):
            # numpy datetime64
            date_str = str(date)[:10]
        else:
            date_str = str(date)[:10]

        ndvi_path = f'satellite_images/ndvi_{date_str}.npy'
        lst_path = f'satellite_images/lst_{date_str}.npy'

        if os.path.exists(ndvi_path) and os.path.exists(lst_path):
            ndvi = np.load(ndvi_path)
            lst = np.load(lst_path)
            ndvi_list.append(ndvi)
            lst_list.append(lst)
            valid_dates.append(date)

        if i % 500 == 0:
            print(f"  Loaded {i}/{len(dates)} images")

    print(f"  Successfully loaded {len(ndvi_list)} image pairs")

    if len(ndvi_list) == 0:
        print("  WARNING: No images found! Generating synthetic data...")
        # Generate synthetic satellite data if none found
        num_days = len(dates)
        ndvi_list = [np.random.uniform(0.3, 0.8, (64, 64)) for _ in range(num_days)]
        lst_list = [np.random.uniform(20, 45, (64, 64)) for _ in range(num_days)]
        valid_dates = list(dates)

    # Normalize images
    ndvi_arr = np.array(ndvi_list)
    lst_arr = np.array(lst_list)

    # Normalize NDVI to [0, 1]
    ndvi_norm = (ndvi_arr - ndvi_arr.min()) / (ndvi_arr.max() - ndvi_arr.min() + 1e-8)

    # Normalize LST to [0, 1]
    lst_norm = (lst_arr - lst_arr.min()) / (lst_arr.max() - lst_arr.min() + 1e-8)

    # Stack as channels (samples, height, width, channels)
    images = np.stack([ndvi_norm, lst_norm], axis=-1)
    print(f"  Final image shape: {images.shape}")

    return images, valid_dates

def create_sequences(images, fire_data, sequence_length=SEQUENCE_LENGTH):
    """Create time-series sequences for training"""
    print(f"Creating sequences of length {sequence_length}...")

    X, y, y_fire = [], [], []

    for i in range(len(images) - sequence_length):
        X.append(images[i:i+sequence_length])
        y.append(images[i+sequence_length])
        # Binary fire classification for the target day
        y_fire.append(fire_data['fire_occurred'].iloc[i+sequence_length])

    X = np.array(X)
    y = np.array(y)
    y_fire = np.array(y_fire)

    print(f"  X shape: {X.shape}")
    print(f"  y shape: {y.shape}")
    print(f"  Fire labels: {y_fire.sum()} fires out of {len(y_fire)} samples")

    return X, y, y_fire

def build_cnn_lstm_model(input_shape):
    """Build the CNN-LSTM hybrid model"""
    print("Building CNN-LSTM model...")

    model = Sequential([
        # TimeDistributed CNN for spatial feature extraction
        TimeDistributed(
            Conv2D(32, (3, 3), activation='relu', padding='same'),
            input_shape=input_shape
        ),
        TimeDistributed(BatchNormalization()),
        TimeDistributed(MaxPooling2D((2, 2))),
        TimeDistributed(Dropout(0.25)),

        TimeDistributed(Conv2D(64, (3, 3), activation='relu', padding='same')),
        TimeDistributed(BatchNormalization()),
        TimeDistributed(MaxPooling2D((2, 2))),
        TimeDistributed(Dropout(0.25)),

        TimeDistributed(Conv2D(128, (3, 3), activation='relu', padding='same')),
        TimeDistributed(BatchNormalization()),
        TimeDistributed(MaxPooling2D((2, 2))),
        TimeDistributed(Dropout(0.25)),

        # Flatten spatial features
        TimeDistributed(Flatten()),

        # LSTM for temporal pattern learning
        LSTM(256, return_sequences=True, dropout=0.3),
        LSTM(128, return_sequences=False, dropout=0.3),

        # Dense layers for reconstruction
        Dense(512, activation='relu'),
        Dropout(0.3),
        Dense(IMAGE_SIZE * IMAGE_SIZE * 2, activation='sigmoid'),
        Reshape((IMAGE_SIZE, IMAGE_SIZE, 2))
    ])

    model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )

    return model

def train_model(X_train, X_test, y_train, y_test):
    """Train the CNN-LSTM model"""

    input_shape = (SEQUENCE_LENGTH, IMAGE_SIZE, IMAGE_SIZE, 2)
    model = build_cnn_lstm_model(input_shape)

    print("\nModel Summary:")
    model.summary()

    # Callbacks
    callbacks = [
        EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        ModelCheckpoint(
            MODEL_PATH,
            monitor='val_loss',
            save_best_only=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1
        )
    ]

    print("\nTraining model...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1
    )

    return model, history

def plot_training_history(history):
    """Generate training visualization plots"""
    print("Generating training plots...")

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Loss plot
    axes[0].plot(history.history['loss'], label='Training Loss', linewidth=2, color='#ff6b6b')
    axes[0].plot(history.history['val_loss'], label='Validation Loss', linewidth=2, color='#4ecdc4')
    axes[0].set_title('Model Loss Over Epochs', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Epoch', fontsize=12)
    axes[0].set_ylabel('Loss (MSE)', fontsize=12)
    axes[0].legend(loc='upper right', fontsize=10)
    axes[0].grid(True, alpha=0.3)
    axes[0].set_facecolor('#f8f9fa')

    # MAE plot
    axes[1].plot(history.history['mae'], label='Training MAE', linewidth=2, color='#ff6b6b')
    axes[1].plot(history.history['val_mae'], label='Validation MAE', linewidth=2, color='#4ecdc4')
    axes[1].set_title('Mean Absolute Error Over Epochs', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Epoch', fontsize=12)
    axes[1].set_ylabel('MAE', fontsize=12)
    axes[1].legend(loc='upper right', fontsize=10)
    axes[1].grid(True, alpha=0.3)
    axes[1].set_facecolor('#f8f9fa')

    plt.tight_layout()
    plt.savefig('static/images/training_history.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("  Saved: static/images/training_history.png")

def plot_predictions(model, X_test, y_test, num_samples=5):
    """Visualize model predictions vs ground truth"""
    print("Generating prediction visualizations...")

    predictions = model.predict(X_test[:num_samples], verbose=0)

    fig, axes = plt.subplots(num_samples, 4, figsize=(16, 4*num_samples))

    for i in range(num_samples):
        # True NDVI
        im1 = axes[i, 0].imshow(y_test[i, :, :, 0], cmap='RdYlGn', vmin=0, vmax=1)
        axes[i, 0].set_title(f'True NDVI (Sample {i+1})', fontsize=11)
        axes[i, 0].axis('off')
        plt.colorbar(im1, ax=axes[i, 0], fraction=0.046)

        # Predicted NDVI
        im2 = axes[i, 1].imshow(predictions[i, :, :, 0], cmap='RdYlGn', vmin=0, vmax=1)
        axes[i, 1].set_title(f'Predicted NDVI (Sample {i+1})', fontsize=11)
        axes[i, 1].axis('off')
        plt.colorbar(im2, ax=axes[i, 1], fraction=0.046)

        # True LST
        im3 = axes[i, 2].imshow(y_test[i, :, :, 1], cmap='hot', vmin=0, vmax=1)
        axes[i, 2].set_title(f'True LST (Sample {i+1})', fontsize=11)
        axes[i, 2].axis('off')
        plt.colorbar(im3, ax=axes[i, 2], fraction=0.046)

        # Predicted LST
        im4 = axes[i, 3].imshow(predictions[i, :, :, 1], cmap='hot', vmin=0, vmax=1)
        axes[i, 3].set_title(f'Predicted LST (Sample {i+1})', fontsize=11)
        axes[i, 3].axis('off')
        plt.colorbar(im4, ax=axes[i, 3], fraction=0.046)

    plt.tight_layout()
    plt.savefig('static/images/predictions.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("  Saved: static/images/predictions.png")

def save_training_stats(history, fire_df):
    """Save training statistics as JSON for the dashboard"""
    stats = {
        'training_date': datetime.now().isoformat(),
        'total_samples': len(fire_df),
        'fire_incidents': int(fire_df['fire_occurred'].sum()),
        'epochs_trained': len(history.history['loss']),
        'final_loss': float(history.history['loss'][-1]),
        'final_val_loss': float(history.history['val_loss'][-1]),
        'final_mae': float(history.history['mae'][-1]),
        'final_val_mae': float(history.history['val_mae'][-1]),
        'loss_history': [float(x) for x in history.history['loss']],
        'val_loss_history': [float(x) for x in history.history['val_loss']],
        'model_accuracy': float(1 - history.history['val_mae'][-1]) * 100
    }

    with open('models/training_stats.json', 'w') as f:
        json.dump(stats, f, indent=2)
    print("  Saved: models/training_stats.json")

    return stats

def main():
    """Main training pipeline"""
    print("="*60)
    print("ALMORA FOREST FIRE PREDICTION - CNN-LSTM MODEL TRAINING")
    print("="*60)

    os.makedirs('models', exist_ok=True)
    os.makedirs('static/images', exist_ok=True)

    # Load data
    fire_df = load_fire_data()
    images, valid_dates = load_satellite_images(fire_df['date'].values)

    # Create sequences
    X, y, y_fire = create_sequences(images, fire_df)

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"\nTraining samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")

    # Train model
    model, history = train_model(X_train, X_test, y_train, y_test)

    # Save visualizations
    plot_training_history(history)
    plot_predictions(model, X_test, y_test)

    # Save statistics
    stats = save_training_stats(history, fire_df)

    print("\n" + "="*60)
    print("TRAINING COMPLETE!")
    print("="*60)
    print(f"\nModel saved: {MODEL_PATH}")
    print(f"Final Validation Loss: {stats['final_val_loss']:.4f}")
    print(f"Final Validation MAE: {stats['final_val_mae']:.4f}")
    print(f"Estimated Accuracy: {stats['model_accuracy']:.1f}%")
    print("\nGenerated files:")
    print("  - models/almora_fire_model.keras")
    print("  - models/training_stats.json")
    print("  - static/images/training_history.png")
    print("  - static/images/predictions.png")

if __name__ == "__main__":
    main()

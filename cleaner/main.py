import numpy as np
import scipy.signal as sp_signal
import pywt
import random
import matplotlib.pyplot as plt


file_path = "signal.txt"
signal = np.loadtxt(file_path, delimiter=',')

# Bandpass Filter (0.5 - 50 Hz)
fs = 500  # Sampling frequency
lowcut = 0.5
highcut = 50


def bandpass_filter(data, lowcut, highcut, fs, order=2):
    nyquist = 0.5 * fs
    low = lowcut / nyquist
    high = highcut / nyquist
    b, a = sp_signal.butter(order, [low, high], btype='band')
    return sp_signal.filtfilt(b, a, data)


# Moving Average Filter
def moving_average_filter(data, window_size):
    window_size = int(window_size)  # Ensure window_size is an integer
    return np.convolve(data, np.ones(window_size) / window_size, mode='same')


# Wavelet Denoising
def wavelet_denoise(data, wavelet='db4', level=3):
    coeffs = pywt.wavedec(data, wavelet, level=level)
    sigma = np.median(np.abs(coeffs[-1])) / 0.6745  # Robust thresholding
    threshold = sigma * np.sqrt(2 * np.log(len(data)))
    coeffs = [pywt.threshold(c, threshold, mode='soft') for c in coeffs]
    return pywt.waverec(coeffs, wavelet)[:len(data)]

# Fitness Function: Evaluate SNR and feature preservation
def fitness_function(params, ecg_signal):
    lowcut, highcut, window_size, wavelet_level = params

    # Ensure window_size and wavelet_level are integers
    window_size = int(round(window_size))
    wavelet_level = int(wavelet_level)

    filtered_signal = bandpass_filter(ecg_signal, lowcut, highcut, fs)
    smoothed_signal = moving_average_filter(filtered_signal, window_size)
    denoised_signal = wavelet_denoise(smoothed_signal, level=wavelet_level)

    # Calculate SNR: Signal-to-Noise Ratio
    noise = ecg_signal - denoised_signal
    signal_power = np.var(ecg_signal)
    noise_power = np.var(noise)
    snr = 10 * np.log10(signal_power / noise_power)

    # Feature preservation (use peak detection, here a simplified measure)
    original_r_peaks = detect_r_peaks(ecg_signal)
    denoised_r_peaks = detect_r_peaks(denoised_signal)
    feature_preservation = len(set(original_r_peaks) & set(denoised_r_peaks)) / len(original_r_peaks)

    # Combine both fitness measures (SNR and feature preservation)
    return snr + feature_preservation


# Simplified R-peak detection (to calculate feature preservation)
def detect_r_peaks(ecg_signal):
    threshold = np.max(ecg_signal) * 0.6
    r_peaks = np.where(ecg_signal > threshold)[0]
    return r_peaks


# Genetic Algorithm Components
def generate_initial_population(pop_size, param_ranges):
    population = np.random.uniform(low=[x[0] for x in param_ranges],
                                   high=[x[1] for x in param_ranges],
                                   size=(pop_size, len(param_ranges)))
    return population


def crossover(parent1, parent2):
    crossover_point = random.randint(0, len(parent1) - 1)
    return np.concatenate([parent1[:crossover_point], parent2[crossover_point:]])


def mutate(chromosome, mutation_rate, param_ranges):
    for i in range(len(chromosome)):
        if random.random() < mutation_rate:
            chromosome[i] = random.uniform(param_ranges[i][0], param_ranges[i][1])
    return chromosome


# Main GA loop
def genetic_algorithm(ecg_signal, pop_size=50, generations=100, mutation_rate=0.01):
    param_ranges = [(0.5, 1.0), (40, 50), (3, 10), (1, 5)]  # Ranges for lowcut, highcut, window_size, wavelet_level
    population = generate_initial_population(pop_size, param_ranges)

    best_individual = None
    best_fitness = float('-inf')

    for generation in range(generations):
        fitness_scores = np.array([fitness_function(individual, ecg_signal) for individual in population])

        # Select the best individuals (e.g., top 50%)
        selected_parents = population[np.argsort(fitness_scores)[-pop_size // 2:]]

        # Generate new population through crossover and mutation
        new_population = []
        while len(new_population) < pop_size:
            parent1, parent2 = random.sample(list(selected_parents), 2)
            offspring = crossover(parent1, parent2)
            offspring = mutate(offspring, mutation_rate, param_ranges)
            new_population.append(offspring)

        population = np.array(new_population)

        # Update the best solution
        max_fitness = np.max(fitness_scores)
        if max_fitness > best_fitness:
            best_fitness = max_fitness
            best_individual = population[np.argmax(fitness_scores)]

        # Print the best fitness of this generation
        print(f"Generation {generation}, Best Fitness: {best_fitness}")

    return best_individual


# Run the genetic algorithm
best_params = genetic_algorithm(signal)
print(f"Best parameters: {best_params}")

# Ensure correct types for each parameter
lowcut, highcut, window_size, wavelet_level = best_params

# Ensure window_size is an integer and within reasonable limits (e.g., at least 1)
window_size = int(round(window_size))
if window_size < 1:
    print("Warning: window_size is less than 1. Setting it to 1.")
    window_size = 1

# Ensure wavelet_level is an integer and within a reasonable range
wavelet_level = int(round(wavelet_level))
if wavelet_level < 1:
    print("Warning: wavelet_level is less than 1. Setting it to 1.")
    wavelet_level = 1

# Apply filters using the best parameters
try:
    # Bandpass filter
    filtered_signal = bandpass_filter(signal, lowcut, highcut, fs)
    # Moving average filter
    smoothed_signal = moving_average_filter(filtered_signal, window_size)
    # Wavelet denoising
    denoised_signal = wavelet_denoise(smoothed_signal, level=wavelet_level)
except Exception as e:
    print(f"Error during signal processing: {e}")

# Plot Results
try:
    plt.figure(figsize=(12, 5))
    plt.plot(signal, color='gray', alpha=0.5, label='Original ECG')
    plt.plot(denoised_signal, color='blue', label='Denoised ECG', linewidth=1.5)
    plt.xlabel("Sample")
    plt.ylabel("Amplitude")
    plt.title("Denoised ECG Signal")
    plt.legend()
    plt.grid()
    plt.show()
except Exception as e:
    print(f"Error during plotting: {e}")

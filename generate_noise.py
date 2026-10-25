import subprocess
import wave
import random
import struct
import os

# 1. Create PowerShell script
ps_script = """
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("clean_speech.wav")
$synth.Speak("The access code for the secure mainframe is 8 4 9 2. Do not let the security team find out.")
$synth.Dispose()
"""
with open("gen.ps1", "w") as f:
    f.write(ps_script)

# 2. Run PowerShell script
subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", "gen.ps1"])

# 3. Read the generated WAV file
with wave.open("clean_speech.wav", "rb") as wav_in:
    params = wav_in.getparams()
    frames = wav_in.readframes(params.nframes)

# Assuming 16-bit PCM
num_samples = params.nframes * params.nchannels
samples = list(struct.unpack(f"<{num_samples}h", frames))

# 4. Add bursts of harsh white noise (static)
for _ in range(8):
    start = random.randint(0, max(0, len(samples) - 20000))
    end = start + random.randint(5000, 25000)
    for i in range(start, min(end, len(samples))):
        samples[i] = random.randint(-32768, 32767) # Pure white noise

# 5. Save the corrupted WAV file
new_frames = struct.pack(f"<{len(samples)}h", *samples)
with wave.open("real_noisy_intercept.wav", "wb") as wav_out:
    wav_out.setparams(params)
    wav_out.writeframes(new_frames)

# Cleanup temp files
os.remove("gen.ps1")
os.remove("clean_speech.wav")
print("Corrupted WAV generated successfully!")

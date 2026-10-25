import subprocess
import wave
import random
import struct
import os

def create_corrupted_wav(text, filename):
    # 1. Create PowerShell script to generate clean speech
    ps_script = f"""
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile("temp_clean.wav")
$synth.Speak("{text}")
$synth.Dispose()
    """
    with open("gen.ps1", "w") as f:
        f.write(ps_script)

    # 2. Run PowerShell script
    subprocess.run(["powershell", "-ExecutionPolicy", "Bypass", "-File", "gen.ps1"])

    # 3. Read the generated WAV file
    with wave.open("temp_clean.wav", "rb") as wav_in:
        params = wav_in.getparams()
        frames = wav_in.readframes(params.nframes)

    # Assuming 16-bit PCM
    num_samples = params.nframes * params.nchannels
    samples = list(struct.unpack(f"<{num_samples}h", frames))

    # 4. Add bursts of harsh white noise (static)
    for _ in range(8):
        start = random.randint(0, max(0, len(samples) - 20000))
        end = start + random.randint(8000, 30000)
        for i in range(start, min(end, len(samples))):
            samples[i] = random.randint(-32768, 32767) # Pure white noise

    # 5. Save the corrupted WAV file
    new_frames = struct.pack(f"<{len(samples)}h", *samples)
    with wave.open(filename, "wb") as wav_out:
        wav_out.setparams(params)
        wav_out.writeframes(new_frames)

    # Cleanup temp files
    os.remove("gen.ps1")
    os.remove("temp_clean.wav")
    print(f"Generated {filename}")

# Generate Ransomware Clip
create_corrupted_wav(
    "Listen to me very carefully. If you do not wire the fifty million dollars in Bitcoin within forty eight hours, all of your encrypted hospital systems will be permanently deleted.", 
    "real_ransomware_corrupted.wav"
)

# Generate Insider Threat Clip
create_corrupted_wav(
    "I just transferred the stolen database to the offshore account in the Cayman Islands. Make absolutely sure the security team does not trace the IP address back to my laptop.", 
    "real_insider_threat.wav"
)

print("All new authentic datasets generated successfully!")

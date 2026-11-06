import os
import time
import shutil
import tempfile
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

MEGA_EMAIL           = os.getenv("MEGA_EMAIL")
MEGA_PASSWORD        = os.getenv("MEGA_PASSWORD")
MEGA_UPLOAD_FOLDER   = os.getenv("MEGA_UPLOAD_FOLDER", "uploads")
MEGA_OUTPUT_FOLDER   = os.getenv("MEGA_OUTPUT_FOLDER", "outputs")
MEGA_INPUT_FILENAME  = os.getenv("MEGA_INPUT_FILENAME", "frames.zip")
MEGA_OUTPUT_FILENAME = os.getenv("MEGA_OUTPUT_FILENAME", "output.glb")

POLL_INTERVAL = 15  # seconds between polls


def _login():
    from mega import Mega
    m = Mega().login(MEGA_EMAIL, MEGA_PASSWORD)
    return m


def upload_to_mega(local_file_path: str) -> bool:
    """Upload the zip/tar file to Mega /uploads/ as frames.zip."""
    m = _login()
    folder = m.find(MEGA_UPLOAD_FOLDER)
    if folder is None:
        raise Exception(f"Mega folder '{MEGA_UPLOAD_FOLDER}' not found")
    folder_node = folder[0]
    m.upload(local_file_path, dest=folder_node, dest_filename=MEGA_INPUT_FILENAME)
    return True


def _find_output_glb(m):
    """Check if output.glb exists in Mega /outputs/. Returns file node or None."""
    folder = m.find(MEGA_OUTPUT_FOLDER)
    if folder is None:
        return None
    folder_id = folder[0]
    files = m.get_files()
    for file_id, info in files.items():
        if info["t"] == 0:
            name = info["a"].get("n") if info.get("a") else None
            if name == MEGA_OUTPUT_FILENAME and info.get("p") == folder_id:
                return (file_id, info)
    return None


def download_glb_from_mega(dest_path: str) -> bool:
    """
    Poll Mega /outputs/ until output.glb appears, then download it.
    Blocks until file is found. Runs inside a background thread.
    Returns True when downloaded successfully.
    """
    m = _login()

    while True:
        file_node = _find_output_glb(m)
        if file_node is not None:
            break
        time.sleep(POLL_INTERVAL)

    # Download to temp dir
    temp_dir = tempfile.mkdtemp(prefix="aerosepct_")
    try:
        m.download(file_node, dest_path=temp_dir)
    except PermissionError:
        # Known mega.py bug — file downloaded fine, cleanup failed
        pass

    # Find the downloaded glb
    glb_files = list(Path(temp_dir).glob("*.glb"))
    if not glb_files:
        raise FileNotFoundError("GLB not found in temp dir after download")

    shutil.move(str(glb_files[0]), dest_path)

    # Cleanup temp
    try:
        shutil.rmtree(temp_dir, ignore_errors=True)
    except Exception:
        pass

    # Delete from Mega so it doesn't re-trigger
    try:
        m.delete(file_node[0])
    except Exception:
        pass

    return True

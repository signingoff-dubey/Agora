import httpx
import logging

logger = logging.getLogger(__name__)

OLLAMA_HOST = "http://localhost:11434"

AVAILABLE_MODELS = [
    "llama3",
    "mistral",
    "gemma2",
    "phi3",
    "qwen2",
    "deepseek-r1",
    "codellama",
    "mixtral",
    "llama2",
    "orca-mini",
]


def get_installed_models() -> list[str]:
    """Returns a list of installed model names, or an empty list on failure."""
    try:
        response = httpx.get(f"{OLLAMA_HOST}/api/tags", timeout=5.0)
        if response.status_code == 200:
            data = response.json()
            models = []
            for model in data.get("models", []):
                name = model.get("name", "")
                if name and name not in models:
                    models.append(name)
            return models
        logger.warning(f"Ollama returned status {response.status_code}")
        return []
    except httpx.ConnectError:
        logger.warning("Cannot connect to Ollama. Is it running?")
        return []
    except httpx.TimeoutException:
        logger.warning("Ollama connection timed out")
        return []
    except Exception as e:
        logger.warning(f"Could not reach Ollama: {e}")
        return []


def is_ollama_running() -> bool:
    try:
        response = httpx.get(f"{OLLAMA_HOST}/api/tags", timeout=2.0)
        return response.status_code == 200
    except Exception:
        return False


def get_model_discovery() -> dict:
    """Returns model discovery info for the frontend."""
    ollama_running = is_ollama_running()
    installed = get_installed_models() if ollama_running else []
    installed_bases = [m.split(":")[0] for m in installed]
    available = [m for m in AVAILABLE_MODELS if m not in installed_bases]

    return {
        "installed": installed,
        "available": available,
        "ollama_running": ollama_running,
    }

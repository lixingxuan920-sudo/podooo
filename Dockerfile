FROM python:3.11.9-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

COPY vedic-python-api/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --only-binary=pysweph,pydantic-core -r requirements.txt \
    && pip install --no-cache-dir --no-deps "dashaflow>=0.3"

COPY main.py ./main.py
COPY vedic-python-api ./vedic-python-api
RUN python vedic-python-api/install_ephemeris.py

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3).read()"

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

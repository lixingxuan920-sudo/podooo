FROM python:3.11.9-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata \
    && rm -rf /var/lib/apt/lists/*

COPY vedic-python-api/requirements.txt ./requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir --only-binary=pysweph,pydantic-core -r requirements.txt \
    && pip install --no-cache-dir --no-deps "dashaflow>=0.3"

COPY main.py ./main.py
COPY vedic-python-api ./vedic-python-api
COPY netlify/functions/ephe/seas_18.se1 ./ephemeris/seas_18.se1
COPY netlify/functions/ephe/sepl_18.se1 ./ephemeris/sepl_18.se1
COPY ephemeris-source/semo_18.se1.part0 ./ephemeris/semo_18.se1.part0
COPY ephemeris-source/semo_18.se1.part1 ./ephemeris/semo_18.se1.part1
RUN python -c "import jhora, pathlib, shutil; src=pathlib.Path('/app/ephemeris'); dst=pathlib.Path(jhora.__file__).parent/'data'/'ephe'; dst.mkdir(parents=True, exist_ok=True); shutil.copy2(src/'seas_18.se1', dst/'seas_18.se1'); shutil.copy2(src/'sepl_18.se1', dst/'sepl_18.se1'); (dst/'semo_18.se1').write_bytes((src/'semo_18.se1.part0').read_bytes() + (src/'semo_18.se1.part1').read_bytes())"

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=3).read()"

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

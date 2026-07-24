# Luna Vedic Python API

这是给公网版印度占星使用的 Python 星历排盘后端。

它提供：

- `vedic-astro-skills` v7.0 的 `vedic-calculator` 原生排盘引擎
- Swiss Ephemeris 真实星历与 TRUE_CITRA / Lahiri Ayanamsa
- D1 本命盘、15 张分盘（D1-D60）
- Nakshatra 月宿与 Pada
- Vimshottari Mahadasha 与 Antardasha
- Shadbala、SAV/BAV、Chara Karakas、AL/UL、宫主表和尊贵度
- SAV=337、Rahu/Ketu 对冲等硬校验
- 可选 `VEDIC_API_KEY` 保护接口

计算代码固定到上游提交 `7a6e33e23dc1f45107af2f249848241bb4d22b67`；
校验失败时接口直接报错，不回退到近似排盘。

## 本地运行

```bash
cd vedic-python-api
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

测试：

```bash
curl http://localhost:8000/health
```

## Render 部署（推荐 Docker）

1. 把整个项目上传到 GitHub。
2. 在 Render 创建 Web Service。
3. Environment 选择 `Docker`。
4. Root Directory 留空。
5. Dockerfile Path 填：

```text
./Dockerfile
```

6. Health Check Path 填：

```text
/health
```

7. 部署后拿到类似：

```text
https://luna-vedic-python-api.onrender.com
```

如果你已经在 Render 里创建了旧服务，请把 Environment 改成 Docker，或重新建一个 Docker Web Service。

## Render Python 环境备用方案

项目也保留了 `runtime.txt`，固定：

```text
python-3.11.9
```

但由于 `pyswisseph` 对 Python 版本和 wheel 支持比较敏感，公网部署优先使用 Docker。

## 接到 Netlify

在 Netlify 的环境变量里添加：

```text
VEDIC_API_URL=https://你的-python-api域名
```

如果 Render 设置了 `VEDIC_API_KEY`，Netlify 也要添加同一个：

```text
VEDIC_API_KEY=你的后端密钥
```

前端会通过 `/.netlify/functions/vedic-skill-bridge` 自动调用这个 Python 后端。

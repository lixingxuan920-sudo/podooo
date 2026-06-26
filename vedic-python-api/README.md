# Luna Vedic Python API

这是给公网版印度占星使用的 Python 星历排盘后端。

它提供：

- Swiss Ephemeris 真实星历
- Lahiri Ayanamsa
- D1 本命盘上升与九曜落座
- Nakshatra 月宿与 Pada
- Vimshottari Dasha 大运
- 可选 `VEDIC_API_KEY` 保护接口

当前不会伪造 SAV/BAV、Shadbala、完整分盘量化值。这些模块需要后续接入完整 PyJHora/JHora 校验后再启用。

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

## Render 部署

1. 把整个项目上传到 GitHub。
2. 在 Render 创建 Web Service。
3. Root Directory 填：

```text
vedic-python-api
```

4. Build Command：

```bash
pip install -r requirements.txt
```

5. Start Command：

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

6. 部署后拿到类似：

```text
https://luna-vedic-python-api.onrender.com
```

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

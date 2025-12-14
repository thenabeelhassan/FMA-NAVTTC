# FMA-NAVTTC

File Management Application for NAVTTC Assessments

## DEV

```bash
npm run dev
```

## Docker

```bash
docker build -t fma-navttc .
```

```bash
docker run -d -p 7000:3000 --name fma-navttc -v data:/data fma-navttc
```

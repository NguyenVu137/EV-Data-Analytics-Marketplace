const crypto = require('crypto');
const Dataset = require('../models/Dataset');

// Simple in-memory vector store for demo/testing.
// In production use a proper vector DB (Pinecone, Weaviate, Milvus...)
const store = [];

function embedText(text) {
  // If OpenAI key present, optionally call embedding API later. For now use hash->vector fallback.
  const hash = crypto.createHash('sha256').update(text || '').digest();
  // convert first 8 bytes to numbers
  const vec = [];
  for (let i = 0; i < 8; i++) vec.push(hash.readUInt8(i) / 255);
  return vec;
}

function dot(a, b) {
  let s = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) s += a[i] * b[i];
  return s;
}

async function indexAllDatasets() {
  const datasets = await Dataset.findAll();
  store.length = 0;
  for (const d of datasets) {
    const v = embedText(`${d.title} ${d.description} ${d.dataCategory}`);
    store.push({ id: d.id, vec: v, meta: { title: d.title, category: d.dataCategory } });
  }
}

async function retrieveTopK(query, k = 5) {
  if (store.length === 0) await indexAllDatasets();
  const qv = embedText(query);
  const scored = store.map(item => ({ id: item.id, score: dot(qv, item.vec), meta: item.meta }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

module.exports = { indexAllDatasets, retrieveTopK };

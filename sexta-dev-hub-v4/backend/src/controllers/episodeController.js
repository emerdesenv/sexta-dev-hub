import fs from 'fs';
import path from 'path';
import slugify from 'slugify';
import { z } from 'zod';
import { Episode } from '../models/index.js';

const episodeSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  year_target: z.coerce.number().int().min(1).max(3),
  category: z.string().min(2),
  is_published: z.coerce.boolean().optional().default(false),
  duration_label: z.string().max(40).optional().or(z.literal('')),
  tags: z.string().optional().default(''),
});

function toPublicEpisode(episode, req) {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const json = episode.toJSON();
  return {
    ...json,
    cover_url: json.cover_path ? `${baseUrl}/${json.cover_path}` : null,
    audio_url: json.audio_path ? `${baseUrl}/${json.audio_path}` : null,
    pdf_url: json.pdf_path ? `${baseUrl}/${json.pdf_path}` : null,
  };
}

export async function listPublic(req, res) {
  const where = { is_published: true };
  if (req.query.year) where.year_target = Number(req.query.year);
  if (req.query.category) where.category = req.query.category;
  const episodes = await Episode.findAll({ where, order: [['created_at', 'DESC']] });
  return res.json(episodes.map(ep => toPublicEpisode(ep, req)));
}

export async function listAdmin(req, res) {
  const episodes = await Episode.findAll({ order: [['created_at', 'DESC']] });
  return res.json(episodes.map(ep => toPublicEpisode(ep, req)));
}

export async function getPublicBySlug(req, res) {
  const episode = await Episode.findOne({ where: { slug: req.params.slug, is_published: true } });
  if (!episode) return res.status(404).json({ message: 'Episódio não encontrado.' });
  return res.json(toPublicEpisode(episode, req));
}

function removeFileIfExists(relativePath) {
  if (!relativePath) return;
  const absolute = path.resolve(relativePath);
  if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
}

export async function createEpisode(req, res) {
  const data = episodeSchema.parse(req.body);
  const slug = slugify(data.title, { lower: true, strict: true, locale: 'pt' });
  const existing = await Episode.findOne({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const episode = await Episode.create({
    ...data,
    slug: finalSlug,
    tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    cover_path: req.files?.cover?.[0] ? path.posix.join('uploads/images', req.files.cover[0].filename) : null,
    audio_path: req.files?.audio?.[0] ? path.posix.join('uploads/audio', req.files.audio[0].filename) : null,
    pdf_path: req.files?.pdf?.[0] ? path.posix.join('uploads/pdf', req.files.pdf[0].filename) : null,
  });

  return res.status(201).json(toPublicEpisode(episode, req));
}

export async function updateEpisode(req, res) {
  const episode = await Episode.findByPk(req.params.id);
  if (!episode) return res.status(404).json({ message: 'Episódio não encontrado.' });

  const data = episodeSchema.partial().parse(req.body);
  const updatePayload = {
    ...data,
  };

  if (data.title && data.title !== episode.title) {
    updatePayload.slug = slugify(data.title, { lower: true, strict: true, locale: 'pt' });
  }
  if (data.tags !== undefined) {
    updatePayload.tags = data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  }

  if (req.files?.cover?.[0]) {
    removeFileIfExists(episode.cover_path);
    updatePayload.cover_path = path.posix.join('uploads/images', req.files.cover[0].filename);
  }
  if (req.files?.audio?.[0]) {
    removeFileIfExists(episode.audio_path);
    updatePayload.audio_path = path.posix.join('uploads/audio', req.files.audio[0].filename);
  }
  if (req.files?.pdf?.[0]) {
    removeFileIfExists(episode.pdf_path);
    updatePayload.pdf_path = path.posix.join('uploads/pdf', req.files.pdf[0].filename);
  }

  await episode.update(updatePayload);
  return res.json(toPublicEpisode(episode, req));
}

export async function deleteEpisode(req, res) {
  const episode = await Episode.findByPk(req.params.id);
  if (!episode) return res.status(404).json({ message: 'Episódio não encontrado.' });

  removeFileIfExists(episode.cover_path);
  removeFileIfExists(episode.audio_path);
  removeFileIfExists(episode.pdf_path);
  await episode.destroy();
  return res.json({ message: 'Episódio removido com sucesso.' });
}

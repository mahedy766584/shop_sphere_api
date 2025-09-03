/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Model, Schema } from 'mongoose';
import slug from 'slug';

slug.defaults.modes['rfc3986'] = {
  replacement: '-',
  remove: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/g,
  lower: true,
  charmap: slug.charmap,
  multicharmap: slug.multicharmap,
  trim: true,
  fallback: true,
};

export const generateUniqueSlug = async (
  model: Model<any>,
  value: string,
  key: string = 'slug',
): Promise<string> => {
  const baseSlug = slug(value, { mode: 'rfc3986' });
  let uniqueSlug = baseSlug;
  let count = 1;

  while (await model.exists({ [key]: uniqueSlug })) {
    uniqueSlug = `${baseSlug}-${count}`;
    count++;
  }

  return uniqueSlug;
};

export const slugPlugin = (schema: Schema, options?: { source?: string; field?: string }) => {
  const sourceField = options?.source || 'name';
  const slugField = options?.field || 'slug';

  schema.pre('save', async function (next) {
    const doc = this as any;
    const ModelCtor = this.constructor as Model<any>;

    if (!doc[slugField] || doc.isModified(sourceField)) {
      doc[slugField] = await generateUniqueSlug(ModelCtor, doc[sourceField], slugField);
    }
    next();
  });

  schema.pre(['findOneAndUpdate', 'updateOne'], async function (next) {
    const update: any = this.getUpdate();
    const ModelCtor = this.model as Model<any>;

    if (update?.[sourceField]) {
      update[slugField] = await generateUniqueSlug(ModelCtor, update[sourceField], slugField);
      this.setUpdate(update);
    }
    next();
  });
};

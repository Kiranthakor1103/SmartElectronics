import { Schema, model, Document, Types } from "mongoose";

export interface ISubCategory {
  name: string;
  slug?: string;
  icon?: string;
}

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug?: string;
  image?: string;
  color?: string;
  icon?: string;
  href?: string;
  subCategories?: ISubCategory[];
  active?: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, trim: true },
    image: { type: String },
    color: { type: String },
    icon: { type: String },
    href: { type: String },
    subCategories: [
      {
        name: { type: String, required: true },
        slug: { type: String },
        icon: { type: String },
      },
    ],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 });
CategorySchema.index({ active: 1, name: 1 });

export const Category = model<ICategory>("Category", CategorySchema);

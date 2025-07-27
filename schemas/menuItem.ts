import { defineField, defineType } from "sanity";

const menuItem = defineType({
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  fields: [
    defineField({
      name: "nameEn",
      title: "Name (English)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "nameMn",
      title: "Name (Mongolian)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Coffee", value: "coffee" },
          { title: "Non Coffee", value: "non-coffee" },
          { title: "Specialty", value: "specialty" },
          { title: "Grub", value: "grub" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "prices",
      title: "Prices",
      type: "object",
      fields: [
        defineField({
          name: "default",
          title: "Default Cup Price",
          type: "number",
          validation: (rule) => rule.positive().precision(2),
        }),
        defineField({
          name: "small",
          title: "Small Cup Price",
          type: "number",
          validation: (rule) => rule.positive().precision(2), // optional
        }),
        defineField({
          name: "large",
          title: "Large Cup Price",
          type: "number",
          validation: (rule) => rule.positive().precision(2), // optional
        }),
      ],
    }),
    defineField({
      name: "variants",
      title: "Variants / Flavors",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "nameEn",
              title: "Variant Name (English)",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "nameMn",
              title: "Variant Name (Mongolian)",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "available",
      title: "Available",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "nameEn",
      category: "category",
      media: "image",
    },
    prepare({ title, category, media }) {
      return {
        title,
        subtitle: category || "No category",
        media,
      };
    },
  },
});

export default menuItem;

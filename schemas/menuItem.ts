import { defineField, defineType } from "sanity";

const menuItem = defineType({
  name: "menuItem",
  title: "Menu Item",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
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
      name: "price",
      title: "Price",
      type: "number",
      validation: (rule) => rule.required().positive(),
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
      title: "name",
      category: "category",
      media: "image",
      price: "price",
    },
    prepare(selection) {
      const { title, category } = selection;
      return {
        title,
        subtitle: category ? `${category}` : "No category",
      };
    },
  },
});

export default menuItem;

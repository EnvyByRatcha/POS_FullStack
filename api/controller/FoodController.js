const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");

module.exports = {
  create: async (req, res) => {
    try {
      const { name, price, img, foodType, foodTypeId } = req.body;

      await prisma.food.create({
        data: {
          name,
          price:parseInt(price),
          img: img ?? "",
          foodType,
          foodTypeId,
          status: "use",
        },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ message: e.message });
    }
  },
  update: async (req, res) => {
    try {
      const { name, price, foodType, foodTypeId, id } = req.body;

      let image = req.body.img;
      if (image === undefined) {
        const row = await prisma.food.findFirst({
          where: { id },
        });

        image = row.img;
      }
      await prisma.food.update({
        data: {
          name,
          price,
          foodType,
          foodTypeId: parseInt(foodTypeId),
          img: image,
        },
        where: { id },
      });

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ message: e.message });
    }
  },
  list: async (req, res) => {
    try {
      const results = await prisma.food.findMany({
        include: {
          FoodType: true,
        },
        orderBy: {
          id: "desc",
        },
        where: {
          status: "use",
        },
      });

      return res.send({ results: results });
    } catch (e) {
      return res.status(500).send({ message: e.message });
    }
  },
  listPaginate: async (req, res) => {
    try {
      const page = req.body.page ?? 1;
      const pageSize = req.body.pageSize ?? 10;

      const results = await prisma.food.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          FoodType: true,
        },
        where: {
          status: "use",
        },
      });

      const total = await prisma.food.count({
        where: {
          status: "use",
        },
      });

      return res.send({ results: results, total: total });
    } catch (e) {
      return res.status(500).send({ message: e.message });
    }
  },
  filter: async (req, res) => {
    try {
      const results = await prisma.food.findMany({
        include: {
          FoodType: true,
        },
        where: {
          foodType: req.params.foodType,
          status: "use",
        },
        orderBy: {
          id: "desc",
        },
      });

      return res.send({ results: results });
    } catch (e) {
      return res.status(500).send({ message: e.message });
    }
  },
  upload: async (req, res) => {
    try {
      if (req.files.img !== undefined) {
        const img = req.files.img;
        const fileName = img.name;

        img.mv("uploads/foods/" + fileName, (err) => {
          if (err) {
            res.send({ error: err });
          }
        });

        return res.send({ fileName: fileName });
      } else {
        return res.send({ message: "file not found" });
      }
    } catch (e) {
      return res.status(500).send({ message: e.message });
    }
  },
  remove: async (req, res) => {
    try {
      const result = await prisma.food.update({
        data: {
          status: "delete",
        },
        where: { id: parseInt(req.params.id) },
      });

      if (result) {
        if (result.img || result.img !== "") {
          if (fs.existsSync(`uploads/foods/${result.img}`)) {
            fs.unlinkSync(`uploads/foods/${result.img}`);
          }
        }
      }

      return res.send({ message: "success" });
    } catch (e) {
      return res.status(500).send({ message: e.message });
    }
  },
};

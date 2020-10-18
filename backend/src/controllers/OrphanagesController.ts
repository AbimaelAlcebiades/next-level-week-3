import { getRepository } from "typeorm";
import { Orphanage } from "../models/Orphanage";
import { Request, Response } from "express";
import orphanageView from "../views/orphanages_view";
import * as Yup from "yup";
import { Image } from "../models/Image";

export default {

  async index(request: Request, response: Response) {
    const orphangeRepository = getRepository(Orphanage);
    const orphanages = await orphangeRepository.find({
      relations: ['images']
    });
    return response.json(orphanageView.renderMany(orphanages));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;
    const orphangeRepository = getRepository(Orphanage);
    const orphanage = await orphangeRepository.findOneOrFail(id, {
      relations: ['images']
    });
    return response.json(orphanageView.render(orphanage));
  },

  async create(request: Request, response: Response) {
    const requestImages = request.files as Express.Multer.File[];
    let images: Array<Image> = [];

    if (requestImages) {
      images = requestImages.map(requestImage => {
        const image = new Image();
        image.path = requestImage.filename;
        return image;
      });
    }

    const {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends
    } = request.body;

    const orphangeRepository = getRepository(Orphanage);

    const data = {
      name,
      latitude,
      longitude,
      about,
      instructions,
      opening_hours,
      open_on_weekends: open_on_weekends == 'true',
      images
    };

    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latitude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required().max(300),
      instructions: Yup.string().required(),
      opening_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required()
        }))
    })

    const finalData = schema.cast(data);

    await schema.validate(data, {
      abortEarly: false
    })

    try {
      const orphanage = orphangeRepository.create(data);
      response.status(201).send(await orphangeRepository.save(orphanage))
    } catch (e) {
      response.status(500).send(e);
    }

  }
}
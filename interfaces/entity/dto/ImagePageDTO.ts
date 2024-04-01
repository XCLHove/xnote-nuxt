import { PageDTO } from "@/interfaces/entity/dto/PageDTO.ts";
import { Image } from "@/interfaces/entity/Image.ts";

export interface ImagePageDTO extends PageDTO<Image> {
  searchAlias?: string;
}

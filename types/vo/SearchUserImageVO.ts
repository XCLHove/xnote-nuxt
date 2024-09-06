import type { UserImage } from '~/types/table/UserImage'
import type { Image } from '~/types/table/Image'

export type SearchUserImageVO = UserImage & Pick<Image, 'lastDownloadTime'>

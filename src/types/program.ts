export interface WordPressProgram {
  id: number

  slug: string

  title: {
    rendered: string
  }

  content: {
    rendered: string
  }

  acf: {
  host?: string

  penyiar?: string

  jadwal_hari?: string

  jam_siaran?: string

  jam_mulai?: string

  jam_selesai?: string

  hari?: string[]

  program_order?: number

  announcers?: number[]

  gambar_landscape?: number

  banner_program?: number 
}

  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string

      media_details?: {
        sizes?: {
          medium_large?: {
            source_url: string
          }
        }
      }
    }>
  }
}
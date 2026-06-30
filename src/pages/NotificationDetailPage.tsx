import { useEffect, useState } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  ArrowLeft,
  X,
  ExternalLink,
} from 'lucide-react'

import { useNotifications } from '@/hooks/useNotifications'
import { getMedia } from '@/services/wordpress-api'

import {
  markNotificationRead,
} from '@/utils/notificationStorage'

import {
  dismissNotification,
} from '@/utils/notificationStorage'


export function NotificationDetailPage() {
  const { id } = useParams()

  const navigate = useNavigate()

  const { data } =
    useNotifications()

  const notification =
    data?.find(
      (item) =>
        item.id === Number(id)
    )

  const [image, setImage] =
    useState('')
    
useEffect(() => {
  if (notification?.id) {
    markNotificationRead(
      notification.id
    )
  }
}, [notification])

  useEffect(() => {
    async function loadImage() {
      const mediaId =
        notification?.acf
          ?.notification_image

      if (!mediaId) return

      const media =
        await getMedia(mediaId)

      setImage(media.source_url)
    }

    loadImage()
  }, [notification])

  if (!notification) {
    return null
  }

  return (
    <div
      className="
        min-h-screen
        bg-black
        text-white
      "
    >
      {/* HERO IMAGE */}

      <div className="relative">

        {image && (
          <img
            src={image}
            alt=""
            className="
              h-[55vh]
              w-full
              object-cover
            "
          />
        )}

        {/* TOP BAR */}

        <div
          className="
            absolute
            left-0
            right-0
            top-0
            flex
            items-center
            justify-between
            p-5
          "
        >
          <button
            onClick={() =>
              navigate(-1)
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-black/50
              backdrop-blur
            "
          >
            <ArrowLeft
              size={20}
            />
          </button>

          <button
            onClick={() =>
              navigate('/')
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-black/50
              backdrop-blur
            "
          >
            <X size={20} />
          </button>
        </div>

      </div>

      {/* CONTENT */}

      <div className="p-6">

        <span
          className="
            rounded-full
            bg-red-600
            px-3
            py-1
            text-xs
            font-semibold
          "
        >
          {
            notification.acf
              ?.notification_type
          }
        </span>

        <h1
          className="
            mt-4
            text-3xl
            font-bold
          "
        >
          {
            notification.acf
              ?.notification_title
          }
        </h1>

        <p
          className="
            mt-4
            text-white/80
            leading-relaxed
          "
        >
          {
            notification.acf
              ?.notification_message
          }
        </p>

        {/* CTA */}

        {notification.acf
          ?.deep_link && (
          <a
            href={
              notification.acf
                ?.deep_link
            }
            className="
              mt-8
              flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              bg-[#bda752]
              px-6
              py-4
              font-semibold
              text-black
            "
          >
            Open Content

            <button
  onClick={() => {
    dismissNotification(
      notification.id
    )

    navigate('/')
  }}
  className="
    mt-6
    rounded-xl
    border
    border-white/20
    px-4
    py-3
  "
>
  Hide Notification
</button>

            <ExternalLink
              size={18}
            />
          </a>
        )}

      </div>
    </div>
  )
}
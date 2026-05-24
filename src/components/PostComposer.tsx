import { useState } from "react";
import imageCompression from "browser-image-compression";

import {
  X,
  Image,
  Hash,
  Calendar,
  Clock,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { api } from "../api/api";
import { PostStatus } from "../lib/supabase";

const MAX_CHARS = 280;

const INSTAGRAM_WIDTH = 1080;
const INSTAGRAM_HEIGHT = 1350;

interface EditPost {
  id: string;
  content: string;
  scheduled_at: string;
  status: PostStatus;
  media_url?: string | null;
  hashtags?: string[];
}

interface PostComposerProps {
  onClose: () => void;
  editPost?: EditPost;
}

export default function PostComposer({
  onClose,
  editPost,
}: PostComposerProps) {
  const now = new Date();

  now.setMinutes(
    now.getMinutes() + 30
  );

  const defaultDate =
    now
      .toISOString()
      .slice(0, 16);

  const [content, setContent] =
    useState(
      editPost?.content ?? ""
    );

  const [
    scheduledAt,
    setScheduledAt,
  ] = useState(
    editPost?.scheduled_at
      ? editPost.scheduled_at.slice(
          0,
          16
        )
      : defaultDate
  );

  const [status, setStatus] =
    useState<PostStatus>(
      editPost?.status ??
        "scheduled"
    );

  const [image, setImage] =
    useState<File | null>(
      null
    );

  const [
    imagePreview,
    setImagePreview,
  ] = useState(
    editPost?.media_url ?? ""
  );

  const [
    hashtagInput,
    setHashtagInput,
  ] = useState("");

  const [hashtags, setHashtags] =
    useState<string[]>(
      editPost?.hashtags ?? []
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const charsLeft =
    MAX_CHARS -
    content.length -
    hashtags.join(" ").length -
    (hashtags.length > 0
      ? 1
      : 0);

  const isOverLimit =
    charsLeft < 0;

  // =========================================
  // Hashtag
  // =========================================

  const addHashtag = () => {
    const tag =
      hashtagInput
        .trim()
        .replace(/^#/, "");

    if (
      tag &&
      !hashtags.includes(
        `#${tag}`
      )
    ) {
      setHashtags([
        ...hashtags,
        `#${tag}`,
      ]);
    }

    setHashtagInput("");
  };

  const removeHashtag = (
    tag: string
  ) => {
    setHashtags(
      hashtags.filter(
        h => h !== tag
      )
    );
  };

  // =========================================
  // Instagram Resize + Crop
  // =========================================

  const createInstagramImage =
    async (
      file: File
    ): Promise<File> => {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          const img =
            new window.Image();

          img.onload =
            async () => {
              try {
                const canvas =
                  document.createElement(
                    "canvas"
                  );

                const ctx =
                  canvas.getContext(
                    "2d"
                  );

                if (
                  !ctx
                ) {
                  reject(
                    new Error(
                      "Canvas error"
                    )
                  );

                  return;
                }

                canvas.width =
                  INSTAGRAM_WIDTH;

                canvas.height =
                  INSTAGRAM_HEIGHT;

                const imageAspect =
                  img.width /
                  img.height;

                const targetAspect =
                  INSTAGRAM_WIDTH /
                  INSTAGRAM_HEIGHT;

                let drawWidth =
                  0;

                let drawHeight =
                  0;

                let offsetX =
                  0;

                let offsetY =
                  0;

                // Smart center crop

                if (
                  imageAspect >
                  targetAspect
                ) {
                  drawHeight =
                    INSTAGRAM_HEIGHT;

                  drawWidth =
                    drawHeight *
                    imageAspect;

                  offsetX =
                    (INSTAGRAM_WIDTH -
                      drawWidth) /
                    2;
                } else {
                  drawWidth =
                    INSTAGRAM_WIDTH;

                  drawHeight =
                    drawWidth /
                    imageAspect;

                  offsetY =
                    (INSTAGRAM_HEIGHT -
                      drawHeight) /
                    2;
                }

                ctx.drawImage(
                  img,
                  offsetX,
                  offsetY,
                  drawWidth,
                  drawHeight
                );

                canvas.toBlob(
                  async blob => {
                    if (
                      !blob
                    ) {
                      reject(
                        new Error(
                          "Blob failed"
                        )
                      );

                      return;
                    }

                    const instagramFile =
                      new File(
                        [blob],
                        "instagram-post.jpg",
                        {
                          type:
                            "image/jpeg",
                        }
                      );

                    const compressedFile =
                      await imageCompression(
                        instagramFile,
                        {
                          maxSizeMB: 1,
                          maxWidthOrHeight: 1350,
                          useWebWorker: true,
                        }
                      );

                    resolve(
                      compressedFile
                    );
                  },
                  "image/jpeg",
                  0.92
                );
              } catch (
                err
              ) {
                reject(
                  err
                );
              }
            };

          img.onerror =
            reject;

          img.src =
            URL.createObjectURL(
              file
            );
        }
      );
    };

  // =========================================
  // Submit
  // =========================================

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      if (
        isOverLimit
      ) {
        setError(
          "Character limit exceeded"
        );

        return;
      }

      if (
        !content.trim()
      ) {
        setError(
          "Post content is required"
        );

        return;
      }

      try {
        setSaving(true);

        const fullContent =
          hashtags.length > 0
            ? `${content} ${hashtags.join(
                " "
              )}`
            : content;

        const formData =
          new FormData();

        formData.append(
          "id",
          crypto.randomUUID()
        );

        formData.append(
          "text",
          fullContent
        );

        formData.append(
          "url",
          ""
        );

        formData.append(
          "description",
          "Scheduled Post"
        );

        formData.append(
          "scheduleTimeAndDate",
          new Date(
            scheduledAt
          ).toISOString()
        );

        if (image) {
          formData.append(
            "image",
            image
          );
        }

        await api.post(
          "/smp",
          formData
        );

        setSuccess(
          "Post scheduled successfully"
        );

        setTimeout(() => {
          onClose();
        }, 1200);
      } catch (err) {
        console.error(err);

        setError(
          "Something went wrong"
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-md">

      {/* SMART SCROLLABLE MODAL */}

      <div
        className="
          flex
          max-h-[95vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            sticky
            top-0
            z-20
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            bg-white
            px-6
            py-5
          "
        >
          <h2 className="text-xl font-bold text-gray-900">
            {editPost
              ? "Edit Post"
              : "Create New Post"}
          </h2>

          <button
            onClick={onClose}
            disabled={saving}
            className="
              rounded-full
              p-2
              text-gray-400
              transition
              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLL AREA */}

        <div
          className="
            overflow-y-auto
            px-6
            py-6
          "
        >

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >

            {/* ERROR */}

            {error && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <AlertCircle
                  size={18}
                />
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* CONTENT */}

            <div className="flex gap-4">

              <div
                className="
                  flex
                  h-11
                  w-11
                  flex-shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-sky-100
                  font-bold
                  text-sky-600
                "
              >
                X
              </div>

              <div className="flex-1">

                <textarea
                  value={content}
                  onChange={e =>
                    setContent(
                      e.target.value
                    )
                  }
                  placeholder="What's happening?"
                  rows={5}
                  autoFocus
                  disabled={saving}
                  className="
                    w-full
                    resize-none
                    text-base
                    leading-relaxed
                    text-gray-900
                    placeholder-gray-400
                    focus:outline-none
                  "
                />

                {/* HASHTAGS */}

                {hashtags.length >
                  0 && (
                  <div className="mt-4 flex flex-wrap gap-2">

                    {hashtags.map(
                      tag => (
                        <div
                          key={tag}
                          className="
                            flex
                            items-center
                            gap-2
                            rounded-full
                            bg-sky-100
                            px-3
                            py-1
                            text-sm
                            font-medium
                            text-sky-700
                          "
                        >
                          {tag}

                          <button
                            type="button"
                            onClick={() =>
                              removeHashtag(
                                tag
                              )
                            }
                          >
                            <X
                              size={
                                14
                              }
                            />
                          </button>
                        </div>
                      )
                    )}

                  </div>
                )}
              </div>
            </div>

            {/* CHARACTER COUNT */}

            <div className="flex justify-end">
              <span
                className={`text-sm font-semibold ${
                  isOverLimit
                    ? "text-red-500"
                    : charsLeft <=
                      20
                    ? "text-amber-500"
                    : "text-gray-400"
                }`}
              >
                {charsLeft}
              </span>
            </div>

            <hr className="border-gray-100" />

            {/* IMAGE */}

            <div>

              <label className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <Image size={16} />
                Upload Image
              </label>

              <input
                type="file"
                accept="image/*"
                disabled={saving}
                onChange={async e => {
                  const file =
                    e.target
                      .files?.[0];

                  if (
                    !file
                  )
                    return;

                  try {
                    const finalImage =
                      await createInstagramImage(
                        file
                      );

                    setImage(
                      finalImage
                    );

                    setImagePreview(
                      URL.createObjectURL(
                        finalImage
                      )
                    );
                  } catch (
                    err
                  ) {
                    console.error(
                      err
                    );

                    setError(
                      "Image processing failed"
                    );
                  }
                }}
                className="
                  w-full
                  rounded-2xl
                  border
                  border-gray-200
                  px-4
                  py-3
                  text-sm
                "
              />

              {/* SMART FIXED PREVIEW */}

              {imagePreview && (
                <div className="mt-5 flex justify-center">

                  <div
                    className="
                      relative
                      h-[240px]
                      w-[180px]
                      overflow-hidden
                      rounded-3xl
                      border
                      border-gray-200
                      bg-gray-100
                      shadow-lg
                    "
                  >

                    <img
                      src={
                        imagePreview
                      }
                      alt="Preview"
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />

                    <div
                      className="
                        absolute
                        bottom-0
                        left-0
                        right-0
                        bg-gradient-to-t
                        from-black/60
                        to-transparent
                        p-3
                      "
                    >
                      <p className="text-xs text-white">
                        Instagram Preview
                      </p>
                    </div>

                  </div>

                </div>
              )}
            </div>

            {/* HASHTAG INPUT */}

            <div>

              <label className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                <Hash size={16} />
                Hashtag
              </label>

              <div className="flex gap-3">

                <input
                  type="text"
                  value={
                    hashtagInput
                  }
                  disabled={saving}
                  onChange={e =>
                    setHashtagInput(
                      e.target.value
                    )
                  }
                  onKeyDown={e => {
                    if (
                      e.key ===
                      "Enter"
                    ) {
                      e.preventDefault();

                      addHashtag();
                    }
                  }}
                  placeholder="topic"
                  className="
                    flex-1
                    rounded-2xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    focus:border-transparent
                    focus:outline-none
                    focus:ring-2
                    focus:ring-sky-500
                  "
                />

                <button
                  type="button"
                  onClick={
                    addHashtag
                  }
                  className="
                    rounded-2xl
                    bg-sky-500
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-sky-600
                  "
                >
                  Add
                </button>

              </div>
            </div>

            {/* SCHEDULE */}

            <div className="grid grid-cols-2 gap-4">

              <div>

                <label className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  <Calendar size={16} />
                  Schedule
                </label>

                <input
                  type="datetime-local"
                  value={
                    scheduledAt
                  }
                  onChange={e =>
                    setScheduledAt(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    focus:border-transparent
                    focus:outline-none
                    focus:ring-2
                    focus:ring-sky-500
                  "
                />
              </div>

              <div>

                <label className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-500">
                  <Clock size={16} />
                  Status
                </label>

                <select
                  value={status}
                  onChange={e =>
                    setStatus(
                      e.target
                        .value as PostStatus
                    )
                  }
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    focus:border-transparent
                    focus:outline-none
                    focus:ring-2
                    focus:ring-sky-500
                  "
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="scheduled">
                    Scheduled
                  </option>
                </select>

              </div>
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={
                saving ||
                isOverLimit ||
                !content.trim()
              }
              className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-sky-500
                py-4
                text-base
                font-bold
                text-white
                transition
                hover:bg-sky-600
                disabled:cursor-not-allowed
                disabled:bg-sky-300
              "
            >
              {saving ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Scheduling...
                </>
              ) : (
                <>
                  <Send size={20} />

                  {editPost
                    ? "Save Changes"
                    : "Schedule Post"}
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
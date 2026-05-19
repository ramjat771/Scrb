import { useState } from "react";

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

  const [mediaUrl, setMediaUrl] =
    useState(
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

        const payload = {
          id: crypto.randomUUID(),

          text: fullContent,

          image:
            mediaUrl || "",

          url: "",

          description:
            "Scheduled Post",

          scheduleTimeAndDate:
            new Date(
              scheduledAt
            ).toISOString(),
        };

        const response =
          await api.post(
            "/smp",
            payload
          );

        console.log(
          "POST CREATED:",
          response
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {editPost
              ? "Edit Post"
              : "New Post"}
          </h2>

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-5 p-6"
        >
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle
                size={16}
              />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          {/* Content */}
          <div className="flex gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sky-100">
              <span className="text-sm font-bold text-sky-600">
                X
              </span>
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
                rows={4}
                autoFocus
                disabled={saving}
                className="w-full resize-none text-[15px] leading-relaxed text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-60"
              />

              {hashtags.length >
                0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {hashtags.map(
                    tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-sm text-sky-600"
                      >
                        {tag}

                        <button
                          type="button"
                          disabled={
                            saving
                          }
                          onClick={() =>
                            removeHashtag(
                              tag
                            )
                          }
                        >
                          <X
                            size={
                              12
                            }
                          />
                        </button>
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Char Count */}
          <div className="flex justify-end">
            <span
              className={`text-sm font-medium ${
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

          {/* Media URL */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Image size={13} />
              Media URL
            </label>

            <input
              type="url"
              value={mediaUrl}
              disabled={saving}
              onChange={e =>
                setMediaUrl(
                  e.target.value
                )
              }
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
            />
          </div>

          {/* Hashtag */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Hash size={13} />
              Hashtag
            </label>

            <div className="flex gap-2">
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
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
              />

              <button
                type="button"
                disabled={saving}
                onClick={
                  addHashtag
                }
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-60"
              >
                Add
              </button>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Calendar size={13} />
                Schedule
              </label>

              <input
                type="datetime-local"
                value={
                  scheduledAt
                }
                disabled={saving}
                onChange={e =>
                  setScheduledAt(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <Clock size={13} />
                Status
              </label>

              <select
                value={status}
                disabled={saving}
                onChange={e =>
                  setStatus(
                    e.target
                      .value as PostStatus
                  )
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={
              saving ||
              isOverLimit ||
              !content.trim()
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 font-semibold text-white transition-colors hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {saving ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Scheduling...
              </>
            ) : (
              <>
                <Send size={16} />
                {editPost
                  ? "Save Changes"
                  : "Schedule Post"}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
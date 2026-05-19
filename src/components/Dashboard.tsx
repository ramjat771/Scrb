import {
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Plus,
  RefreshCw,
  Bird,
} from "lucide-react";
import { api } from "../api/api";
import PostCard from "./PostCard";
import PostComposer from "./PostComposer";
import StatsBar from "./StatsBar";
import FilterBar from "./FilterBar";
type PostStatus =
  | "scheduled"
  | "published";
interface ScheduledPost {
  id: string;
  content: string;
  image?: string;
  url?: string;
  description?: string;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
  status: PostStatus;
}

interface NewPost {
  content: string;
  image?: string;
  url?: string;
  description?: string;
  scheduled_at: string;
}

interface ApiPost {
  _id: string;
  id: string;
  text: string;
  image: string;
  url: string;
  description: string;
  scheduleTimeAndDate: string;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ApiPost[];
}

export default function Dashboard() {
  const [posts, setPosts] = useState<
    ScheduledPost[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [composerOpen, setComposerOpen] =
    useState(false);

  const [editingPost, setEditingPost] =
    useState<ScheduledPost | null>(null);

  const [filter, setFilter] = useState<
    PostStatus | "all"
  >("all");

  const [search, setSearch] =
    useState("");

  const [sortBy, setSortBy] = useState<
    "scheduled_at" | "created_at"
  >("scheduled_at");

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);

      const result =
        await api.get<ApiResponse>(
          "/smp"
        );

      if (result.success) {
        const formattedPosts =
          result.data.map(item => ({
            id: item.id,

            content: item.text,

            image: item.image,

            url: item.url,

            description:
              item.description,

            scheduled_at:
              item.scheduleTimeAndDate,

            created_at:
              item.createdAt,

            updated_at:
              item.updatedAt,

            status:
              item.isProcessed
                ? "published"
                : "scheduled",
          }));

        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error(
        "Fetch posts error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSave = async (
    post: NewPost
  ) => {
    try {
      if (editingPost) {
        await api.put(
          `/smp/${editingPost.id}`,
          post
        );
      } else {
        await api.post(
          "/smp",
          post
        );
      }

      setComposerOpen(false);

      setEditingPost(null);

      fetchPosts();
    } catch (error) {
      console.error(
        "Save post error:",
        error
      );
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmed = confirm(
      "Delete this post?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/smp/${id}`
      );

      setPosts(prev =>
        prev.filter(
          post => post.id !== id
        )
      );
    } catch (error) {
      console.error(
        "Delete post error:",
        error
      );
    }
  };

  const handleEdit = (
    post: ScheduledPost
  ) => {
    setEditingPost(post);

    setComposerOpen(true);
  };

  const filteredPosts = posts
    .filter(post => {
      if (
        filter !== "all" &&
        post.status !== filter
      ) {
        return false;
      }

      if (
        search &&
        !post.content
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      return (
        new Date(
          a[sortBy]
        ).getTime() -
        new Date(
          b[sortBy]
        ).getTime()
      );
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 shadow-sm">
              <Bird
                size={18}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-none text-gray-900">
                Post Scheduler(SCRB)
              </h1>

              <p className="mt-0.5 text-xs text-gray-400">
                Schedule posts for SCRB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchPosts}
              title="Refresh"
              className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <RefreshCw
                size={16}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
            </button>

            <button
              onClick={() => {
                setEditingPost(null);

                setComposerOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-600"
            >
              <Plus size={16} />
              New Post
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
        <StatsBar posts={posts} />

        <FilterBar
          activeFilter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map(
              (_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-xl border border-gray-100 bg-white p-5"
                >
                  <div className="mb-3 h-4 w-16 rounded bg-gray-100" />

                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-100" />

                    <div className="h-3 w-4/5 rounded bg-gray-100" />

                    <div className="h-3 w-3/5 rounded bg-gray-100" />
                  </div>

                  <div className="mt-4 h-3 w-full rounded bg-gray-100" />
                </div>
              )
            )}
          </div>
        ) : filteredPosts.length ===
          0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50">
              <Bird
                size={28}
                className="text-sky-400"
              />
            </div>

            <h3 className="mb-1 font-semibold text-gray-700">
              {search ||
              filter !== "all"
                ? "No posts match your filters"
                : "No posts yet"}
            </h3>

            <p className="mb-6 text-sm text-gray-400">
              {search ||
              filter !== "all"
                ? "Try adjusting your search or filter."
                : "Schedule your first post to get started."}
            </p>

            {!search &&
              filter === "all" && (
                <button
                  onClick={() => {
                    setEditingPost(null);

                    setComposerOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-600"
                >
                  <Plus size={16} />
                  Create First Post
                </button>
              )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map(
              post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={
                    handleEdit
                  }
                  onDelete={
                    handleDelete
                  }
                />
              )
            )}
          </div>
        )}
      </main>

      {composerOpen && (
        <PostComposer
          post={editingPost}
          onSave={handleSave}
          onClose={() => {
            setComposerOpen(false);

            setEditingPost(null);
          }}
        />
      )}
    </div>
  );
}
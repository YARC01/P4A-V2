import React, { useState } from 'react';
import {
  Newspaper,
  Plus,
  Search,
  Calendar,
  User as UserIcon,
  Eye,
  Link,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Edit3,
  X,
  Share2,
  ExternalLink,
  Sparkles,
  Info,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { NewsArticle, User } from '../types.ts';
import { normalizeGoogleDriveImageUrl, fileToDataUrl } from '../utils/googleDriveImage.ts';

interface NewsViewProps {
  news: NewsArticle[];
  currentUser: User;
  onAddNews: (article: NewsArticle) => void;
  onUpdateNews: (article: NewsArticle) => void;
  onDeleteNews: (id: string) => void;
  onTriggerNotification: (title: string, message: string, type: any) => void;
}

const CATEGORIES: Array<NewsArticle['category']> = [
  'Tin Giải Đấu',
  'Thông Báo BTC',
  'Luật & Thể Lệ',
  'Tin CLB & VĐV',
];

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=800&auto=format&fit=crop&q=80',
];

export const NewsView: React.FC<NewsViewProps> = ({
  news,
  currentUser,
  
  onAddNews,
  onUpdateNews,
  onDeleteNews,
  onTriggerNotification,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [readingArticle, setReadingArticle] = useState<NewsArticle | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<NewsArticle['category']>('Tin Giải Đấu');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [imageInputMethod, setImageInputMethod] = useState<'google_drive' | 'upload' | 'url'>('google_drive');
  const [formGoogleDriveUrl, setFormGoogleDriveUrl] = useState('');
  const [formImageUrl, setFormImageUrl] = useState(PRESET_IMAGES[0]);
  const [formFeatured, setFormFeatured] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null);

  const canManageNews =
    currentUser.role === 'super_admin' ||
    currentUser.role === 'admin' ||
    currentUser.role === 'organizer';

  // Filtered news
  const filteredNews = news.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const featuredArticle = news.find(n => n.featured) || news[0];

  const handleOpenCreateModal = () => {
    setEditingArticleId(null);
    setFormTitle('');
    setFormCategory('Tin Giải Đấu');
    setFormSummary('');
    setFormContent('');
    setImageInputMethod('google_drive');
    setFormGoogleDriveUrl('');
    setFormImageUrl(PRESET_IMAGES[0]);
    setFormFeatured(false);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (article: NewsArticle) => {
    setEditingArticleId(article.id);
    setFormTitle(article.title);
    setFormCategory(article.category);
    setFormSummary(article.summary);
    setFormContent(article.content);
    setImageInputMethod(article.imageSourceType);
    setFormGoogleDriveUrl(article.originalDriveUrl || '');
    setFormImageUrl(article.imageUrl);
    setFormFeatured(!!article.featured);
    setIsEditorOpen(true);
  };

  const handleDriveUrlChange = (url: string) => {
    setFormGoogleDriveUrl(url);
    const normalized = normalizeGoogleDriveImageUrl(url);
    setFormImageUrl(normalized.displayUrl);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      setFormImageUrl(dataUrl);
      setImageInputMethod('upload');
      onTriggerNotification('Tải ảnh thành công', `Đã tải ảnh "${file.name}" làm hình đại diện bài viết.`, 'system');
    } catch {
      onTriggerNotification('Lỗi tải ảnh', 'Không thể đọc tệp hình ảnh. Vui lòng thử lại.', 'system');
    }
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onTriggerNotification('Thiếu tiêu đề', 'Vui lòng nhập tiêu đề cho bài viết tin tức.', 'system');
      return;
    }

    let finalImageUrl = formImageUrl;
    let driveUrlToSave: string | undefined = undefined;

    if (imageInputMethod === 'google_drive') {
      const normalized = normalizeGoogleDriveImageUrl(formGoogleDriveUrl);
      finalImageUrl = normalized.displayUrl;
      driveUrlToSave = formGoogleDriveUrl;
    }

    if (editingArticleId) {
      const existing = news.find(n => n.id === editingArticleId);
      if (existing) {
        const updated: NewsArticle = {
          ...existing,
          title: formTitle.trim(),
          category: formCategory,
          summary: formSummary.trim() || formTitle.trim(),
          content: formContent.trim() || formSummary.trim() || formTitle.trim(),
          imageUrl: finalImageUrl,
          imageSourceType: imageInputMethod,
          originalDriveUrl: driveUrlToSave,
          featured: formFeatured,
        };
        onUpdateNews(updated);
        onTriggerNotification('Cập nhật tin tức', `Bài viết "${updated.title}" đã được cập nhật thành công.`, 'tournament');
      }
    } else {
      const newArticle: NewsArticle = {
        id: `news-${Date.now()}`,
        title: formTitle.trim(),
        category: formCategory,
        summary: formSummary.trim() || formTitle.trim(),
        content: formContent.trim() || formSummary.trim() || formTitle.trim(),
        imageUrl: finalImageUrl,
        imageSourceType: imageInputMethod,
        originalDriveUrl: driveUrlToSave,
        authorName: currentUser.name,
        authorRole: currentUser.role === 'super_admin' ? 'Super Admin' : (currentUser.role === 'organizer' ? 'BTC Giải' : 'Admin'),
        publishedDate: new Date().toISOString().slice(0, 10),
        featured: formFeatured,
        viewsCount: 1,
      };
      onAddNews(newArticle);
      onTriggerNotification('Đăng tin thành công', `Bài viết mới "${newArticle.title}" đã được phát hành!`, 'tournament');
    }

    setIsEditorOpen(false);
  };

  const confirmDeleteArticle = () => {
    if (!articleToDelete) return;
    onDeleteNews(articleToDelete.id);
    onTriggerNotification('Đã xóa bài viết', `Đã xóa bài viết "${articleToDelete.title}".`, 'system');
    setArticleToDelete(null);
    if (readingArticle?.id === articleToDelete.id) {
      setReadingArticle(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl border border-emerald-500/20">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-400/30">
            <Newspaper className="w-3.5 h-3.5" />
            <span>TRUNG TÂM BẢN TIN & THÔNG BÁO CHÍNH THỨC</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
            Tin Tức & Thông Báo Giải Đấu
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl font-medium">
            Cập nhật diễn biến giải đấu, lịch bốc thăm, điều lệ điểm số mới và thông báo quan trọng từ Ban Tổ Chức.
          </p>
        </div>

        {canManageNews && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Đăng Bài Viết Mới</span>
          </button>
        )}
      </div>

      {/* Hero Featured Article (if available) */}
      {featuredArticle && selectedCategory === 'all' && !searchTerm && (
        <div
          onClick={() => setReadingArticle(featuredArticle)}
          className="group relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-md hover:shadow-xl transition-all cursor-pointer grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[260px] overflow-hidden bg-slate-100">
            <img
              src={featuredArticle.imageUrl}
              alt={featuredArticle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => {
                (e.target as HTMLImageElement).src = PRESET_IMAGES[0];
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-400 text-amber-950 shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NỔI BẬT</span>
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-slate-900/80 backdrop-blur-sm text-white border border-white/20">
                {featuredArticle.category}
              </span>
              {featuredArticle.imageSourceType === 'google_drive' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/90 text-white flex items-center gap-1">
                  <Link className="w-3 h-3" />
                  <span>Google Drive</span>
                </span>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                  {featuredArticle.authorName} ({featuredArticle.authorRole})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredArticle.publishedDate}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors font-display line-clamp-2">
                {featuredArticle.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                {featuredArticle.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                <span>Đọc bài viết đầy đủ</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                <span>{featuredArticle.viewsCount || 520} lượt xem</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất Cả ({news.length})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat} ({news.filter(n => n.category === cat).length})
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm tin tức, thông báo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* News Grid */}
      {filteredNews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Không tìm thấy bài viết nào</h4>
          <p className="text-xs text-slate-500 mt-1">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc danh mục.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNews.map(article => (
            <div
              key={article.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail */}
                <div
                  className="relative h-48 overflow-hidden bg-slate-100 cursor-pointer"
                  onClick={() => setReadingArticle(article)}
                >
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => {
                      (e.target as HTMLImageElement).src = PRESET_IMAGES[0];
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-slate-900/80 backdrop-blur-sm text-white">
                      {article.category}
                    </span>
                    {article.imageSourceType === 'google_drive' && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500 text-white flex items-center gap-1 shadow-xs">
                        <Link className="w-3 h-3" />
                        <span>Drive</span>
                      </span>
                    )}
                    {article.imageSourceType === 'upload' && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500 text-white flex items-center gap-1 shadow-xs">
                        <Upload className="w-3 h-3" />
                        <span>Ảnh tải lên</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 truncate max-w-[150px]">
                      {article.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {article.publishedDate}
                    </span>
                  </div>

                  <h4
                    onClick={() => setReadingArticle(article)}
                    className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer"
                  >
                    {article.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              {/* Action bar */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setReadingArticle(article)}
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Xem chi tiết</span>
                  <span>→</span>
                </button>

                {canManageNews && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(article)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                      title="Chỉnh sửa bài viết"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleToDelete(article)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Xóa bài viết"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ARTICLE READER MODAL */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                    {readingArticle.category}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {readingArticle.publishedDate}
                  </span>
                  {readingArticle.imageSourceType === 'google_drive' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                      Ảnh từ Google Drive
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 font-display">
                  {readingArticle.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-slate-800 text-xs sm:text-sm leading-relaxed">
              {/* Featured Image */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-80 bg-slate-100">
                <img
                  src={readingArticle.imageUrl}
                  alt={readingArticle.title}
                  className="w-full h-full object-cover max-h-80"
                  onError={e => {
                    (e.target as HTMLImageElement).src = PRESET_IMAGES[0];
                  }}
                />
              </div>

              {/* Author Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                    {readingArticle.authorName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900">{readingArticle.authorName}</div>
                    <div className="text-[11px] text-slate-500">{readingArticle.authorRole}</div>
                  </div>
                </div>

                {readingArticle.originalDriveUrl && (
                  <a
                    href={readingArticle.originalDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Link Drive Gốc</span>
                  </a>
                )}
              </div>

              {/* Summary Lead */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 font-bold text-xs sm:text-sm">
                {readingArticle.summary}
              </div>

              {/* Formatted Content */}
              <div className="space-y-3 whitespace-pre-line text-slate-700">
                {readingArticle.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">PICKLE 4 ALL News Hub</span>
              <button
                type="button"
                onClick={() => setReadingArticle(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ARTICLE MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[92vh] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    {editingArticleId ? 'Chỉnh Sửa Bài Viết' : 'Soạn Thảo Bài Viết & Bản Tin Mới'}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Hỗ trợ dán link hình ảnh trực tiếp từ Google Drive hoặc tải tệp lên
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveArticle} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Tiêu Đề Bài Viết *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khởi tranh giải đấu Mùa Hè 2026 - Lịch thi đấu và sơ đồ nhánh..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Chuyên Mục</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="relative flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={e => setFormFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-extrabold text-slate-800">Đặt làm tin nổi bật (Hero)</span>
                  </label>
                </div>
              </div>

              {/* Image Source Selector: Google Drive vs Upload vs Presets */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Hình Ảnh Đại Diện Bài Viết</span>
                  </span>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('google_drive')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        imageInputMethod === 'google_drive'
                          ? 'bg-sky-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Google Drive Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('upload')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        imageInputMethod === 'upload'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Tải File Lên
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMethod('url')}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                        imageInputMethod === 'url'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ảnh Mẫu Có Sẵn
                    </button>
                  </div>
                </div>

                {/* Option 1: Google Drive */}
                {imageInputMethod === 'google_drive' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="Dán link Google Drive: https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                        value={formGoogleDriveUrl}
                        onChange={e => handleDriveUrlChange(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-[11px] flex items-start gap-2">
                      <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span>Hệ thống tự động chuyển đổi link chia sẻ Google Drive sang ảnh hiển thị trực tiếp. Đảm bảo file được bật quyền "Bất kỳ ai có đường liên kết đều có thể xem".</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Option 2: Upload File */}
                {imageInputMethod === 'upload' && (
                  <div className="space-y-2">
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-300 rounded-2xl bg-purple-50/50 hover:bg-purple-50 cursor-pointer transition-all">
                      <Upload className="w-7 h-7 text-purple-600 mb-1" />
                      <span className="font-bold text-purple-900">Bấm để chọn file ảnh hoặc kéo thả vào đây</span>
                      <span className="text-[10px] text-purple-600 mt-0.5">Hỗ trợ PNG, JPG, WebP</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Option 3: Preset Urls */}
                {imageInputMethod === 'url' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {PRESET_IMAGES.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormImageUrl(img)}
                          className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0 ${
                            formImageUrl === img ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-slate-200'
                          }`}
                        >
                          <img src={img} alt="Preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="url"
                      placeholder="Hoặc dán URL hình ảnh bất kỳ..."
                      value={formImageUrl}
                      onChange={e => setFormImageUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs"
                    />
                  </div>
                )}

                {/* Preview Image */}
                {formImageUrl && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-16 h-12 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      onError={e => {
                        (e.target as HTMLImageElement).src = PRESET_IMAGES[0];
                      }}
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-700 block">Xem trước ảnh đại diện</span>
                      <span className="text-[10px] text-slate-400 font-mono truncate block max-w-sm">
                        {formImageUrl.slice(0, 50)}...
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Tóm Tắt Ngắn (Mô tả hiển thị bên ngoài)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tóm tắt 1-2 câu về nội dung bài viết..."
                  value={formSummary}
                  onChange={e => setFormSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Nội Dung Chi Tiết Bài Viết
                </label>
                <textarea
                  rows={6}
                  placeholder="Nhập toàn bộ nội dung bản tin, thông báo, quy định hoặc cập nhật giải đấu..."
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black shadow-md shadow-emerald-600/25"
                >
                  {editingArticleId ? 'Lưu Cập Nhật' : 'Phát Hành Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-extrabold text-slate-900">Xác Nhận Xóa Bài Viết?</h4>
              <p className="text-xs text-slate-600 mt-1">
                Bạn có chắc chắn muốn xóa bài viết "<strong>{articleToDelete.title}</strong>"? Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setArticleToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={confirmDeleteArticle}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import { useState } from "react";
import type {
  CakeCollectionRow,
  CakeSizeOptionRow,
  CakeStyleImageRow,
  CakeStyleRow,
  CakeStyleSectionRow,
} from "@/db/schema";

type AdminStyleRow = CakeStyleRow & { collection: CakeCollectionRow | null };
type AdminImageStyleRow = AdminStyleRow & { images: CakeStyleImageRow[] };

async function catalogAction(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "保存失败");
  }
}

export function AdminCatalogDashboard({
  collectionCount,
  styleCount,
}: {
  collectionCount: number;
  styleCount: number;
}) {
  return (
    <div className="max-w-5xl">
      <p className="text-sm font-semibold text-[#6B3F2A]">蛋糕目录</p>
      <h1 className="mt-1 text-3xl font-semibold">蛋糕目录 CMS</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Stat label="蛋糕系列" value={collectionCount} href="/admin/catalog/collections" />
        <Stat label="蛋糕款式" value={styleCount} href="/admin/catalog/styles" />
        <Stat label="图片存储" value="对象存储" href="/admin/catalog/images" />
      </div>
    </div>
  );
}

function Stat({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <span className="text-sm font-semibold text-[#7A6258]">{label}</span>
      <span className="mt-2 block text-3xl font-semibold">{value}</span>
    </Link>
  );
}

function slugify(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const ascii = normalized
    .normalize("NFKD")
    .replace(/[^\w-]+/g, "")
    .replace(/_/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return ascii || `item-${Date.now()}`;
}

function generatedSlug(primary: string, fallback: string) {
  return slugify(primary || fallback);
}

function generatedUniqueSlug(primary: string, fallback: string) {
  return `${generatedSlug(primary, fallback)}-${Date.now().toString(36)}`;
}

function generatedSectionKey(primary: string, fallback: string) {
  return slugify(primary || fallback || `section-${Date.now()}`);
}

function LanguageTabs({
  value,
  onChange,
}: {
  value: "zh" | "en";
  onChange: (value: "zh" | "en") => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-[#FFF7EC] p-1">
      {[
        ["zh", "中文"],
        ["en", "English"],
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key as "zh" | "en")}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            value === key ? "bg-[#6B3F2A] text-white" : "text-[#6B3F2A] hover:bg-[#FFE8DC]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function FormFooter({
  language,
  onLanguageChange,
  submitLabel = "保存",
  message,
  onMoveUp,
  onMoveDown,
  onDelete,
  deleteTitle = "确定删除吗？",
}: {
  language?: "zh" | "en";
  onLanguageChange?: (value: "zh" | "en") => void;
  submitLabel?: string;
  message?: string | null;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  deleteTitle?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 mt-6 border-t border-[#FFE8DC] bg-[#FFFCF7]/95 py-4 backdrop-blur">
      {message ? <p className="mb-3 text-sm text-red-600">{message}</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {language && onLanguageChange ? <LanguageTabs value={language} onChange={onLanguageChange} /> : <span />}
        <div className="flex flex-wrap items-center gap-2">
          {onMoveUp ? (
            <IconButton label="上移" onClick={onMoveUp}>
              <ArrowUp size={17} />
            </IconButton>
          ) : null}
          {onMoveDown ? (
            <IconButton label="下移" onClick={onMoveDown}>
              <ArrowDown size={17} />
            </IconButton>
          ) : null}
          {onDelete ? (
            <PopConfirm title={deleteTitle} onConfirm={onDelete}>
              <IconButton label="删除" tone="danger">
                <Trash2 size={17} />
              </IconButton>
            </PopConfirm>
          ) : null}
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6B3F2A] px-5 py-3 font-semibold text-white">
            <Save size={16} /> {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  label,
  children,
  onClick,
  tone = "default",
}: {
  label: string;
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex size-11 items-center justify-center rounded-full border font-semibold transition-colors ${
        tone === "danger"
          ? "border-red-200 text-red-700 hover:bg-red-50"
          : "border-[#E4B9A8] text-[#6B3F2A] hover:bg-[#FFF1E8]"
      }`}
    >
      {children}
    </button>
  );
}

function PopConfirm({
  title,
  onConfirm,
  children,
}: {
  title: string;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <span onClick={() => setOpen(true)}>{children}</span>
      {open ? (
        <span className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-[#FFE8DC] bg-white p-3 text-left shadow-xl">
          <span className="block text-sm font-semibold text-[#2B1E1A]">{title}</span>
          <span className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-[#E4B9A8] px-3 py-1.5 text-sm font-semibold text-[#6B3F2A]"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
              className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-semibold text-white"
            >
              确认删除
            </button>
          </span>
        </span>
      ) : null}
    </span>
  );
}

function AdminDrawer({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="关闭抽屉"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-[#FFFCF7] shadow-2xl transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-[#FFE8DC] px-5 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="inline-flex size-10 items-center justify-center rounded-full bg-[#FFF7EC] text-[#6B3F2A]"
          >
            <X size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </aside>
    </div>
  );
}

export function AdminCollectionsPage({ collections }: { collections: CakeCollectionRow[] }) {
  const [editing, setEditing] = useState<CakeCollectionRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setMessage(null);
    try {
      await catalogAction(collectionPayload(formData, editing ? "updateCollection" : "createCollection", editing?.id));
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    }
  }

  async function toggle(collection: CakeCollectionRow) {
    await catalogAction({ action: "toggleCollection", id: collection.id, isActive: !collection.isActive });
    window.location.reload();
  }

  async function remove(collection: CakeCollectionRow) {
    await catalogAction({ action: "deleteCollection", id: collection.id });
    window.location.reload();
  }

  function openNewCollection() {
    setMessage(null);
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEditCollection(collection: CakeCollectionRow) {
    setMessage(null);
    setEditing(collection);
    setDrawerOpen(true);
  }

  return (
    <div>
      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#6B3F2A]">蛋糕目录</p>
            <h1 className="text-3xl font-semibold">系列管理</h1>
          </div>
          <button onClick={openNewCollection} className="inline-flex items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> 新建系列
          </button>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl bg-[#FFFCF7] shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#FFE8DC] text-[#6B3F2A]">
              <tr><th className="px-4 py-3">标题</th><th className="px-4 py-3">类型</th><th className="px-4 py-3">启用</th><th className="px-4 py-3">操作</th></tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection.id} className="border-t border-[#FFE8DC]">
                  <td className="px-4 py-3">{collection.titleZh} / {collection.titleEn}</td>
                  <td className="px-4 py-3">{catalogTypeLabel(collection.type)}</td>
                  <td className="px-4 py-3">{collection.isActive ? "是" : "否"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditCollection(collection)} className="rounded-full border border-[#E4B9A8] px-3 py-2 font-semibold text-[#6B3F2A]">编辑</button>
                      <button onClick={() => toggle(collection)} className="rounded-full border border-[#E4B9A8] px-3 py-2 font-semibold text-[#6B3F2A]">{collection.isActive ? "停用" : "启用"}</button>
                      <PopConfirm
                        title={`确定删除系列「${collection.titleZh}」吗？相关款式、图片、详情区块和尺寸也会被删除。`}
                        onConfirm={() => void remove(collection)}
                      >
                        <IconButton label="删除" tone="danger">
                          <Trash2 size={16} />
                        </IconButton>
                      </PopConfirm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <AdminDrawer
        open={drawerOpen}
        title={editing ? "编辑蛋糕系列" : "新建蛋糕系列"}
        onClose={() => setDrawerOpen(false)}
      >
        <CollectionForm
          key={editing?.id ?? "new"}
          collection={editing}
          message={message}
          action={submit}
          onDelete={editing ? () => void remove(editing) : undefined}
        />
      </AdminDrawer>
    </div>
  );
}

function CollectionForm({
  collection,
  message,
  action,
  onDelete,
}: {
  collection: CakeCollectionRow | null;
  message: string | null;
  action: (formData: FormData) => void;
  onDelete?: () => void;
}) {
  const [language, setLanguage] = useState<"zh" | "en">("zh");

  return (
    <form action={action} className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{collection ? "编辑系列" : "新建系列"}</h2>
      {collection?.slug ? <input type="hidden" name="slug" defaultValue={collection.slug} /> : null}
      <div className={language === "zh" ? "" : "hidden"}>
        <Input name="titleZh" label="标题" defaultValue={collection?.titleZh} required={language === "zh"} />
        <Textarea name="descriptionZh" label="描述" defaultValue={collection?.descriptionZh ?? ""} />
      </div>
      <div className={language === "en" ? "" : "hidden"}>
        <Input name="titleEn" label="标题" defaultValue={collection?.titleEn} required={language === "en"} />
        <Textarea name="descriptionEn" label="描述" defaultValue={collection?.descriptionEn ?? ""} />
      </div>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">类型</span>
        <select name="type" defaultValue={collection?.type ?? "qixi"} className="input">
          <option value="qixi">七夕</option>
          <option value="birthday">生日</option>
          <option value="custom">主题定制</option>
        </select>
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]">
        <input name="isActive" type="checkbox" defaultChecked={collection?.isActive ?? true} /> 启用
      </label>
      <input type="hidden" name="sortOrder" defaultValue={collection?.sortOrder ?? 0} />
      <FormFooter
        language={language}
        onLanguageChange={setLanguage}
        message={message}
        onDelete={onDelete}
        deleteTitle={`确定删除系列「${collection?.titleZh ?? ""}」吗？相关款式、图片、详情区块和尺寸也会被删除。`}
      />
    </form>
  );
}

export function AdminStylesPage({
  styles,
  collections,
}: {
  styles: AdminStyleRow[];
  collections: CakeCollectionRow[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminStyleRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setMessage(null);
    try {
      await catalogAction(stylePayload(formData, editing ? "updateStyle" : "createStyle", editing?.id));
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    }
  }

  function openNewStyle() {
    setMessage(null);
    setEditing(null);
    setDrawerOpen(true);
  }

  function openEditStyle(style: AdminStyleRow) {
    setMessage(null);
    setEditing(style);
    setDrawerOpen(true);
  }

  async function toggle(style: CakeStyleRow) {
    await catalogAction({ action: "toggleStyle", id: style.id, isActive: !style.isActive });
    window.location.reload();
  }

  async function remove(style: CakeStyleRow) {
    await catalogAction({ action: "deleteStyle", id: style.id });
    window.location.reload();
  }

  return (
    <div>
      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#6B3F2A]">蛋糕目录</p>
            <h1 className="text-3xl font-semibold">蛋糕款式</h1>
          </div>
          <button onClick={openNewStyle} className="inline-flex items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> 新建款式
          </button>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl bg-[#FFFCF7] shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#FFE8DC] text-[#6B3F2A]">
              <tr><th className="px-4 py-3">主图</th><th className="px-4 py-3">款式</th><th className="px-4 py-3">所属系列</th><th className="px-4 py-3">启用</th><th className="px-4 py-3">操作</th></tr>
            </thead>
            <tbody>
              {styles.map((style) => (
                <tr
                  key={style.id}
                  tabIndex={0}
                  onClick={() => router.push(`/admin/catalog/styles/${style.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      router.push(`/admin/catalog/styles/${style.id}`);
                    }
                  }}
                  className="cursor-pointer border-t border-[#FFE8DC] hover:bg-[#FFF7EC]"
                >
                  <td className="px-4 py-3">
                    {style.mainImageUrl ? (
                      <img src={style.mainImageUrl} alt="" className="size-16 rounded-xl object-cover" />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-xl bg-[#FFF7EC] text-xs text-[#7A6258]">无图</div>
                    )}
                  </td>
                  <td className="px-4 py-3"><span className="font-semibold">{style.nameZh}</span><span className="block text-[#7A6258]">{style.slug}</span></td>
                  <td className="px-4 py-3">{style.collection?.titleZh ?? "-"}</td>
                  <td className="px-4 py-3">{style.isActive ? "是" : "否"}</td>
                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <div className="flex gap-2">
                      <button onClick={() => openEditStyle(style)} className="rounded-full border border-[#E4B9A8] px-3 py-2 font-semibold text-[#6B3F2A]">编辑</button>
                      <button onClick={() => toggle(style)} className="rounded-full border border-[#E4B9A8] px-3 py-2 font-semibold text-[#6B3F2A]">{style.isActive ? "停用" : "启用"}</button>
                      <PopConfirm
                        title={`确定删除款式「${style.nameZh}」吗？相关图片、详情区块和尺寸也会被删除。`}
                        onConfirm={() => void remove(style)}
                      >
                        <IconButton label="删除" tone="danger">
                          <Trash2 size={16} />
                        </IconButton>
                      </PopConfirm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <AdminDrawer
        open={drawerOpen}
        title={editing ? "编辑蛋糕款式" : "新建蛋糕款式"}
        onClose={() => setDrawerOpen(false)}
      >
        <StyleForm
          key={editing?.id ?? "new"}
          style={editing}
          collections={collections}
          message={message}
          action={submit}
          onDelete={editing ? () => void remove(editing) : undefined}
        />
      </AdminDrawer>
    </div>
  );
}

function StyleForm({
  style,
  collections,
  message,
  action,
  onDelete,
}: {
  style: CakeStyleRow | null;
  collections: CakeCollectionRow[];
  message: string | null;
  action: (formData: FormData) => void;
  onDelete?: () => void;
}) {
  const [language, setLanguage] = useState<"zh" | "en">("zh");

  return (
    <form action={action} className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{style ? "编辑款式" : "新建款式"}</h2>
      <CollectionSelect collections={collections} defaultValue={style?.collectionId ?? ""} />
      {style?.slug ? <input type="hidden" name="slug" defaultValue={style.slug} /> : null}
      <div className={language === "zh" ? "" : "hidden"}>
        <Input name="nameZh" label="名称" defaultValue={style?.nameZh} required={language === "zh"} />
        <Input name="subtitleZh" label="副标题" defaultValue={style?.subtitleZh ?? ""} />
        <Textarea name="descriptionZh" label="描述" defaultValue={style?.descriptionZh ?? ""} />
        <Input name="badgeZh" label="标签" defaultValue={style?.badgeZh ?? ""} />
      </div>
      <div className={language === "en" ? "" : "hidden"}>
        <Input name="nameEn" label="名称" defaultValue={style?.nameEn} required={language === "en"} />
        <Input name="subtitleEn" label="副标题" defaultValue={style?.subtitleEn ?? ""} />
        <Textarea name="descriptionEn" label="描述" defaultValue={style?.descriptionEn ?? ""} />
        <Input name="badgeEn" label="标签" defaultValue={style?.badgeEn ?? ""} />
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]">
        <input name="isActive" type="checkbox" defaultChecked={style?.isActive ?? true} /> 启用
      </label>
      <input type="hidden" name="sortOrder" defaultValue={style?.sortOrder ?? 0} />
      <FormFooter
        language={language}
        onLanguageChange={setLanguage}
        message={message}
        onDelete={onDelete}
        deleteTitle={`确定删除款式「${style?.nameZh ?? ""}」吗？相关图片、详情区块和尺寸也会被删除。`}
      />
    </form>
  );
}

export function AdminStyleDetailPage({
  style,
  collections,
  images,
  sections,
  sizes,
}: {
  style: CakeStyleRow;
  collections: CakeCollectionRow[];
  images: CakeStyleImageRow[];
  sections: CakeStyleSectionRow[];
  sizes: CakeSizeOptionRow[];
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [basicLanguage, setBasicLanguage] = useState<"zh" | "en">("zh");

  async function uploadFile(file: File) {
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
    const body = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !body.url) {
      setMessage(body.error ?? "上传失败");
      return null;
    }
    return body.url;
  }

  async function uploadMainImage(files: File[]) {
    const url = await uploadFile(files[0]);
    if (!url) {
      return;
    }
    await setMainImage(url);
    window.location.reload();
  }

  async function uploadGallery(files: File[]) {
    for (const [index, file] of files.entries()) {
      const url = await uploadFile(file);
      if (!url) {
        return;
      }
      await catalogAction({
        action: "createImage",
        styleId: style.id,
        imageUrl: url,
        imageType: "gallery",
        sortOrder: images.length + index + 1,
      });
    }
    window.location.reload();
  }

  async function saveBasic(formData: FormData) {
    await catalogAction(stylePayload(formData, "updateStyle", style.id));
    window.location.reload();
  }

  async function setMainImage(url: string) {
    await catalogAction({ action: "updateStyleMainImage", id: style.id, mainImageUrl: url });
  }

  async function deleteStyleDetail() {
    await catalogAction({ action: "deleteStyle", id: style.id });
    window.location.href = "/admin/catalog/styles";
  }

  return (
    <div className="max-w-6xl space-y-6">
      <Link href="/admin/catalog/styles" className="text-sm font-semibold text-[#6B3F2A]">返回款式列表</Link>
      <div>
        <p className="mt-3 text-sm font-semibold text-[#6B3F2A]">蛋糕款式</p>
        <h1 className="text-3xl font-semibold">{style.nameZh}</h1>
      </div>
      {message ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}

      <form action={saveBasic} className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
        <h2 className="text-xl font-semibold">基础信息</h2>
        <input type="hidden" name="slug" defaultValue={style.slug} />
        <div className="grid gap-4 md:grid-cols-2">
          <CollectionSelect collections={collections} defaultValue={style.collectionId ?? ""} />
        </div>
        <div className={basicLanguage === "zh" ? "" : "hidden"}>
          <Input name="nameZh" label="名称" defaultValue={style.nameZh} required={basicLanguage === "zh"} />
          <Input name="subtitleZh" label="副标题" defaultValue={style.subtitleZh ?? ""} />
          <Input name="badgeZh" label="标签" defaultValue={style.badgeZh ?? ""} />
          <Textarea name="descriptionZh" label="描述" defaultValue={style.descriptionZh ?? ""} />
        </div>
        <div className={basicLanguage === "en" ? "" : "hidden"}>
          <Input name="nameEn" label="名称" defaultValue={style.nameEn} required={basicLanguage === "en"} />
          <Input name="subtitleEn" label="副标题" defaultValue={style.subtitleEn ?? ""} />
          <Input name="badgeEn" label="标签" defaultValue={style.badgeEn ?? ""} />
          <Textarea name="descriptionEn" label="描述" defaultValue={style.descriptionEn ?? ""} />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]">
          <input name="isActive" type="checkbox" defaultChecked={style.isActive} /> 启用
        </label>
        <input type="hidden" name="sortOrder" defaultValue={style.sortOrder} />
        <FormFooter
          language={basicLanguage}
          onLanguageChange={setBasicLanguage}
          submitLabel="保存基础信息"
          onDelete={() => void deleteStyleDetail()}
          deleteTitle={`确定删除款式「${style.nameZh}」吗？相关图片、详情区块和尺寸也会被删除。`}
        />
      </form>

      <section className="grid gap-6 lg:grid-cols-2">
        <UploadPanel title="主图" imageUrl={style.mainImageUrl} onFiles={uploadMainImage} />
        <UploadPanel title="图库图片" multiple onFiles={uploadGallery} />
      </section>

      <EditableImages images={images} />
      <EditableSections styleId={style.id} sections={sections} />
      <EditableSizes styleId={style.id} sizes={sizes} />
    </div>
  );
}

export function AdminImagesPage({ styles }: { styles: AdminImageStyleRow[] }) {
  const [message, setMessage] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
    const body = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !body.url) {
      setMessage(body.error ?? "上传失败");
      return null;
    }
    return body.url;
  }

  async function uploadMain(styleId: string, files: File[]) {
    const url = await uploadFile(files[0]);
    if (!url) {
      return;
    }
    await catalogAction({ action: "updateStyleMainImage", id: styleId, mainImageUrl: url });
    window.location.reload();
  }

  async function uploadGallery(styleId: string, currentCount: number, files: File[]) {
    for (const [index, file] of files.entries()) {
      const url = await uploadFile(file);
      if (!url) {
        return;
      }
      await catalogAction({
        action: "createImage",
        styleId,
        imageUrl: url,
        imageType: "gallery",
        sortOrder: currentCount + index + 1,
      });
    }
    window.location.reload();
  }

  async function removeImage(id: string) {
    await catalogAction({ action: "deleteImage", id });
    window.location.reload();
  }

  return (
    <div className="max-w-7xl">
      <div>
        <p className="text-sm font-semibold text-[#6B3F2A]">蛋糕目录</p>
        <h1 className="text-3xl font-semibold">图片管理</h1>
        <p className="mt-2 text-[#7A6258]">按蛋糕款式上传主图和图库图片。图片文件存储在对象存储，数据库只保存公开 URL。</p>
      </div>
      {message ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}
      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        {styles.map((style) => (
          <section key={style.id} className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{style.nameZh}</h2>
                <p className="mt-1 text-sm text-[#7A6258]">{style.collection?.titleZh ?? "未选择系列"} · {style.slug}</p>
              </div>
              <Link href={`/admin/catalog/styles/${style.id}`} className="rounded-full border border-[#E4B9A8] px-3 py-2 text-sm font-semibold text-[#6B3F2A]">
                详情
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
              <div>
                <p className="text-sm font-semibold text-[#6B3F2A]">主图</p>
                {style.mainImageUrl ? (
                  <img src={style.mainImageUrl} alt="" className="mt-2 aspect-square w-full rounded-xl object-cover" />
                ) : (
                  <div className="mt-2 flex aspect-square items-center justify-center rounded-xl bg-[#FFF7EC] text-sm text-[#7A6258]">暂无主图</div>
                )}
                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-2 text-sm font-semibold text-white">
                  <ImagePlus size={16} /> 上传主图
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      if (files.length) void uploadMain(style.id, files);
                    }}
                  />
                </label>
              </div>
              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#6B3F2A]">图库图片</p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E4B9A8] px-4 py-2 text-sm font-semibold text-[#6B3F2A]">
                    <ImagePlus size={16} /> 上传图库
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        if (files.length) void uploadGallery(style.id, style.images.length, files);
                      }}
                    />
                  </label>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {style.images.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-xl border border-[#FFE8DC] bg-white">
                      <img src={image.imageUrl} alt="" className="aspect-square w-full object-cover" />
                      <div className="flex justify-center px-2 py-2">
                        <PopConfirm title="确定删除这张图库图片吗？" onConfirm={() => void removeImage(image.id)}>
                          <IconButton label="删除" tone="danger">
                            <Trash2 size={15} />
                          </IconButton>
                        </PopConfirm>
                      </div>
                    </div>
                  ))}
                  {!style.images.length ? <p className="col-span-full rounded-xl bg-[#FFF7EC] p-4 text-sm text-[#7A6258]">暂无图库图片。</p> : null}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function EditableImages({ images }: { images: CakeStyleImageRow[] }) {
  async function save(formData: FormData, image: CakeStyleImageRow) {
    const altZh = stringValue(formData, "altZh");
    const altEn = stringValue(formData, "altEn");
    await catalogAction({
      action: "updateImage",
      id: image.id,
      styleId: image.styleId ?? "",
      imageUrl: image.imageUrl,
      altZh,
      altEn,
      imageType: stringValue(formData, "imageType") || "gallery",
      sortOrder: numberValue(formData, "sortOrder"),
    });
    window.location.reload();
  }
  async function remove(id: string) {
    await catalogAction({ action: "deleteImage", id });
    window.location.reload();
  }
  async function move(image: CakeStyleImageRow, sortOrder: number, direction: -1 | 1) {
    await catalogAction({
      action: "updateImage",
      id: image.id,
      styleId: image.styleId ?? "",
      imageUrl: image.imageUrl,
      altZh: image.altZh ?? "",
      altEn: image.altEn ?? "",
      imageType: image.imageType ?? "gallery",
      sortOrder: sortOrder + direction,
    });
    window.location.reload();
  }
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">图库图片信息</h2>
      <div className="mt-4 space-y-4">
        {images.map((image, index) => (
          <ImageEditor
            key={image.id}
            image={image}
            sortOrder={image.sortOrder ?? index + 1}
            onSave={(formData) => save(formData, image)}
            onDelete={() => remove(image.id)}
            onMoveUp={() => move(image, image.sortOrder ?? index + 1, -1)}
            onMoveDown={() => move(image, image.sortOrder ?? index + 1, 1)}
          />
        ))}
        {!images.length ? <p className="rounded-xl bg-[#FFF7EC] p-4 text-sm text-[#7A6258]">暂无图库图片，请先通过上方“图库图片”上传。</p> : null}
      </div>
    </section>
  );
}

function ImageEditor({
  image,
  sortOrder,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  image: CakeStyleImageRow;
  sortOrder: number;
  onSave: (formData: FormData) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const [language, setLanguage] = useState<"zh" | "en">("zh");

  return (
    <form action={onSave} className="rounded-xl border border-[#FFE8DC] p-3">
      <div className="grid gap-3 md:grid-cols-[120px_1fr_120px]">
        <img src={image.imageUrl} alt="" className="aspect-square rounded-xl object-cover" />
        <div>
          <div className={language === "zh" ? "" : "hidden"}>
            <Input name="altZh" label="替代文字" defaultValue={image.altZh ?? ""} />
          </div>
          <div className={language === "en" ? "" : "hidden"}>
            <Input name="altEn" label="替代文字" defaultValue={image.altEn ?? ""} />
          </div>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">图片类型</span>
          <select name="imageType" defaultValue={image.imageType ?? "gallery"} className="input">
            <option value="main">主图</option><option value="gallery">图库</option><option value="detail">详情图</option>
          </select>
        </label>
      </div>
      <input type="hidden" name="sortOrder" defaultValue={sortOrder} />
      <FormFooter
        language={language}
        onLanguageChange={setLanguage}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        deleteTitle="确定删除这张图库图片吗？"
      />
    </form>
  );
}

function EditableSections({ styleId, sections }: { styleId: string; sections: CakeStyleSectionRow[] }) {
  async function save(formData: FormData, section?: CakeStyleSectionRow) {
    const rawTitleEn = stringValue(formData, "titleEn");
    const rawTitleZh = stringValue(formData, "titleZh");
    const titleZh = rawTitleZh || rawTitleEn;
    const titleEn = rawTitleEn || rawTitleZh;
    const bodyZh = stringValue(formData, "bodyZh");
    const bodyEn = stringValue(formData, "bodyEn");
    await catalogAction({
      action: section ? "updateSection" : "createSection",
      id: section?.id,
      styleId,
      sectionKey: section?.sectionKey ?? generatedSectionKey(titleEn, titleZh),
      titleZh,
      titleEn,
      bodyZh,
      bodyEn,
      sortOrder: numberValue(formData, "sortOrder"),
      isActive: formData.get("isActive") === "on",
    });
    window.location.reload();
  }
  async function remove(id: string) {
    await catalogAction({ action: "deleteSection", id });
    window.location.reload();
  }
  async function move(section: CakeStyleSectionRow, sortOrder: number, direction: -1 | 1) {
    await catalogAction({
      action: "updateSection",
      id: section.id,
      styleId,
      sectionKey: section.sectionKey,
      titleZh: section.titleZh,
      titleEn: section.titleEn,
      bodyZh: section.bodyZh ?? "",
      bodyEn: section.bodyEn ?? "",
      isActive: section.isActive,
      sortOrder: sortOrder + direction,
    });
    window.location.reload();
  }
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">详情区块</h2>
      <div className="mt-4 space-y-4">
        {[...sections, null].map((section, index) => (
          <SectionEditor
            key={section?.id ?? "new-section"}
            section={section}
            sortOrder={section?.sortOrder ?? index + 1}
            onSave={(formData) => save(formData, section ?? undefined)}
            onDelete={section ? () => remove(section.id) : undefined}
            onMoveUp={section ? () => move(section, section.sortOrder ?? index + 1, -1) : undefined}
            onMoveDown={section ? () => move(section, section.sortOrder ?? index + 1, 1) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function SectionEditor({
  section,
  sortOrder,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  section: CakeStyleSectionRow | null;
  sortOrder: number;
  onSave: (formData: FormData) => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [language, setLanguage] = useState<"zh" | "en">("zh");

  return (
    <form action={onSave} className="rounded-xl border border-[#FFE8DC] p-3">
      <div className={language === "zh" ? "" : "hidden"}>
        <Input name="titleZh" label="标题" defaultValue={section?.titleZh ?? ""} required={language === "zh"} />
        <Textarea name="bodyZh" label="内容" defaultValue={section?.bodyZh ?? ""} />
      </div>
      <div className={language === "en" ? "" : "hidden"}>
        <Input name="titleEn" label="标题" defaultValue={section?.titleEn ?? ""} required={language === "en"} />
        <Textarea name="bodyEn" label="内容" defaultValue={section?.bodyEn ?? ""} />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]"><input name="isActive" type="checkbox" defaultChecked={section?.isActive ?? true} /> 启用</label>
      <input type="hidden" name="sortOrder" defaultValue={sortOrder} />
      <FormFooter
        language={language}
        onLanguageChange={setLanguage}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        deleteTitle={`确定删除详情区块「${section?.titleZh ?? ""}」吗？`}
      />
    </form>
  );
}

function EditableSizes({ styleId, sizes }: { styleId: string; sizes: CakeSizeOptionRow[] }) {
  async function save(formData: FormData, size?: CakeSizeOptionRow) {
    const servingsZh = stringValue(formData, "servingsZh");
    const servingsEn = stringValue(formData, "servingsEn");
    await catalogAction({
      action: size ? "updateSize" : "createSize",
      id: size?.id,
      styleId,
      sizeLabel: stringValue(formData, "sizeLabel"),
      servingsZh,
      servingsEn,
      price: numberValue(formData, "price"),
      currency: "SGD",
      isDefault: formData.get("isDefault") === "on",
      isActive: formData.get("isActive") === "on",
      sortOrder: numberValue(formData, "sortOrder"),
    });
    window.location.reload();
  }
  async function remove(id: string) {
    await catalogAction({ action: "deleteSize", id });
    window.location.reload();
  }
  async function move(size: CakeSizeOptionRow, sortOrder: number, direction: -1 | 1) {
    await catalogAction({
      action: "updateSize",
      id: size.id,
      styleId,
      sizeLabel: size.sizeLabel,
      servingsZh: size.servingsZh ?? "",
      servingsEn: size.servingsEn ?? "",
      price: size.price,
      currency: size.currency,
      isDefault: size.isDefault,
      isActive: size.isActive,
      sortOrder: sortOrder + direction,
    });
    window.location.reload();
  }
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">尺寸与价格</h2>
      <div className="mt-4 space-y-4">
        {[...sizes, null].map((size, index) => (
          <SizeEditor
            key={size?.id ?? "new-size"}
            size={size}
            sortOrder={size?.sortOrder ?? index + 1}
            onSave={(formData) => save(formData, size ?? undefined)}
            onDelete={size ? () => remove(size.id) : undefined}
            onMoveUp={size ? () => move(size, size.sortOrder ?? index + 1, -1) : undefined}
            onMoveDown={size ? () => move(size, size.sortOrder ?? index + 1, 1) : undefined}
          />
        ))}
      </div>
    </section>
  );
}

function SizeEditor({
  size,
  sortOrder,
  onSave,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  size: CakeSizeOptionRow | null;
  sortOrder: number;
  onSave: (formData: FormData) => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const [language, setLanguage] = useState<"zh" | "en">("zh");

  return (
    <form action={onSave} className="rounded-xl border border-[#FFE8DC] p-3">
      <div className="grid gap-3 md:grid-cols-4">
        <Input name="sizeLabel" label="尺寸" defaultValue={size?.sizeLabel ?? ""} required={Boolean(size)} />
        <Input name="price" label="价格" type="number" defaultValue={size?.price ?? 77} />
        <div className={language === "zh" ? "" : "hidden"}>
          <Input name="servingsZh" label="份量说明" defaultValue={size?.servingsZh ?? ""} />
        </div>
        <div className={language === "en" ? "" : "hidden"}>
          <Input name="servingsEn" label="份量说明" defaultValue={size?.servingsEn ?? ""} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]"><input name="isDefault" type="checkbox" defaultChecked={size?.isDefault ?? false} /> 默认</label>
        <label className="flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]"><input name="isActive" type="checkbox" defaultChecked={size?.isActive ?? true} /> 启用</label>
      </div>
      <input type="hidden" name="sortOrder" defaultValue={sortOrder} />
      <FormFooter
        language={language}
        onLanguageChange={setLanguage}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        deleteTitle={`确定删除尺寸「${size?.sizeLabel ?? ""}」吗？`}
      />
    </form>
  );
}

function UploadPanel({
  title,
  imageUrl,
  multiple = false,
  onFiles,
}: {
  title: string;
  imageUrl?: string | null;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}) {
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      {imageUrl ? <img src={imageUrl} alt="" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" /> : <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-[#FFF7EC] text-[#7A6258]">暂无图片</div>}
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-3 font-semibold text-white">
        <ImagePlus size={16} /> 上传图片
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} className="hidden" onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
        }} />
      </label>
    </section>
  );
}

function CollectionSelect({ collections, defaultValue }: { collections: CakeCollectionRow[]; defaultValue: string }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">所属系列</span>
      <select name="collectionId" defaultValue={defaultValue} className="input">
        <option value="">未选择系列</option>
        {collections.map((collection) => (
          <option key={collection.id} value={collection.id}>{collection.titleZh} / {catalogTypeLabel(collection.type)}</option>
        ))}
      </select>
    </label>
  );
}

function Input({ label, name, defaultValue, type = "text", required = false }: { label: string; name: string; defaultValue?: string | number | null; type?: string; required?: boolean }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} className="input" required={required} />
    </label>
  );
}

function Textarea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string | null }) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">{label}</span>
      <textarea name={name} defaultValue={defaultValue ?? ""} className="input min-h-24 resize-y" />
    </label>
  );
}

function collectionPayload(formData: FormData, action: string, id?: string) {
  const rawTitleZh = stringValue(formData, "titleZh");
  const rawTitleEn = stringValue(formData, "titleEn");
  const titleZh = rawTitleZh || rawTitleEn;
  const titleEn = rawTitleEn || rawTitleZh;
  return {
    action,
    id,
    slug: stringValue(formData, "slug") || generatedUniqueSlug(titleEn, titleZh),
    titleZh,
    titleEn,
    descriptionZh: stringValue(formData, "descriptionZh"),
    descriptionEn: stringValue(formData, "descriptionEn"),
    type: stringValue(formData, "type"),
    sortOrder: numberValue(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on",
  };
}

function stylePayload(formData: FormData, action: string, id?: string) {
  const rawNameZh = stringValue(formData, "nameZh");
  const rawNameEn = stringValue(formData, "nameEn");
  const nameZh = rawNameZh || rawNameEn;
  const nameEn = rawNameEn || rawNameZh;
  return {
    action,
    id,
    collectionId: stringValue(formData, "collectionId"),
    slug: stringValue(formData, "slug") || generatedSlug(nameEn, nameZh),
    nameZh,
    nameEn,
    subtitleZh: stringValue(formData, "subtitleZh"),
    subtitleEn: stringValue(formData, "subtitleEn"),
    descriptionZh: stringValue(formData, "descriptionZh"),
    descriptionEn: stringValue(formData, "descriptionEn"),
    badgeZh: stringValue(formData, "badgeZh"),
    badgeEn: stringValue(formData, "badgeEn"),
    sortOrder: numberValue(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on",
  };
}

function stringValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function numberValue(formData: FormData, name: string) {
  return Number(formData.get(name) ?? 0);
}

function catalogTypeLabel(type: string) {
  if (type === "qixi") {
    return "七夕";
  }
  if (type === "birthday") {
    return "生日";
  }
  if (type === "custom") {
    return "主题定制";
  }
  return type;
}

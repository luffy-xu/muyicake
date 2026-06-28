"use client";

import Link from "next/link";
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import type {
  CakeCollectionRow,
  CakeSizeOptionRow,
  CakeStyleImageRow,
  CakeStyleRow,
  CakeStyleSectionRow,
} from "@/db/schema";

type AdminStyleRow = CakeStyleRow & { collection: CakeCollectionRow | null };

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
        <Stat label="图片存储" value="对象存储" href="/admin/catalog/styles" />
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

export function AdminCollectionsPage({ collections }: { collections: CakeCollectionRow[] }) {
  const [editing, setEditing] = useState<CakeCollectionRow | null>(collections[0] ?? null);
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

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#6B3F2A]">蛋糕目录</p>
            <h1 className="text-3xl font-semibold">系列管理</h1>
          </div>
          <button onClick={() => setEditing(null)} className="inline-flex items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> 新建系列
          </button>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl bg-[#FFFCF7] shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#FFE8DC] text-[#6B3F2A]">
              <tr><th className="px-4 py-3">Slug</th><th className="px-4 py-3">标题</th><th className="px-4 py-3">类型</th><th className="px-4 py-3">启用</th><th className="px-4 py-3">操作</th></tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection.id} className="border-t border-[#FFE8DC]">
                  <td className="px-4 py-3 font-semibold">{collection.slug}</td>
                  <td className="px-4 py-3">{collection.titleZh} / {collection.titleEn}</td>
                  <td className="px-4 py-3">{catalogTypeLabel(collection.type)}</td>
                  <td className="px-4 py-3">{collection.isActive ? "是" : "否"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(collection)} className="rounded-full border border-[#E4B9A8] px-3 py-2 font-semibold text-[#6B3F2A]">编辑</button>
                      <button onClick={() => toggle(collection)} className="rounded-full border border-[#E4B9A8] px-3 py-2 font-semibold text-[#6B3F2A]">{collection.isActive ? "停用" : "启用"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <CollectionForm key={editing?.id ?? "new"} collection={editing} message={message} action={submit} />
    </div>
  );
}

function CollectionForm({
  collection,
  message,
  action,
}: {
  collection: CakeCollectionRow | null;
  message: string | null;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{collection ? "编辑系列" : "新建系列"}</h2>
      <Input name="slug" label="Slug 标识" defaultValue={collection?.slug} required />
      <Input name="titleZh" label="中文标题" defaultValue={collection?.titleZh} required />
      <Input name="titleEn" label="英文标题" defaultValue={collection?.titleEn} required />
      <Textarea name="descriptionZh" label="中文描述" defaultValue={collection?.descriptionZh ?? ""} />
      <Textarea name="descriptionEn" label="英文描述" defaultValue={collection?.descriptionEn ?? ""} />
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">类型</span>
        <select name="type" defaultValue={collection?.type ?? "qixi"} className="input">
          <option value="qixi">七夕</option>
          <option value="birthday">生日</option>
          <option value="custom">主题定制</option>
        </select>
      </label>
      <Input name="coverImageUrl" label="封面图片 URL" defaultValue={collection?.coverImageUrl ?? ""} />
      <Input name="sortOrder" label="排序" type="number" defaultValue={collection?.sortOrder ?? 0} />
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]">
        <input name="isActive" type="checkbox" defaultChecked={collection?.isActive ?? true} /> 启用
      </label>
      <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-3 font-semibold text-white">
        <Save size={16} /> 保存
      </button>
      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
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
  const [editing, setEditing] = useState<AdminStyleRow | null>(styles[0] ?? null);
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

  async function toggle(style: CakeStyleRow) {
    await catalogAction({ action: "toggleStyle", id: style.id, isActive: !style.isActive });
    window.location.reload();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#6B3F2A]">蛋糕目录</p>
            <h1 className="text-3xl font-semibold">蛋糕款式</h1>
          </div>
          <button onClick={() => setEditing(null)} className="inline-flex items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> 新建款式
          </button>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl bg-[#FFFCF7] shadow-sm">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#FFE8DC] text-[#6B3F2A]">
              <tr><th className="px-4 py-3">款式</th><th className="px-4 py-3">所属系列</th><th className="px-4 py-3">主图</th><th className="px-4 py-3">启用</th><th className="px-4 py-3">操作</th></tr>
            </thead>
            <tbody>
              {styles.map((style) => (
                <tr key={style.id} className="border-t border-[#FFE8DC]">
                  <td className="px-4 py-3"><span className="font-semibold">{style.nameZh}</span><span className="block text-[#7A6258]">{style.slug}</span></td>
                  <td className="px-4 py-3">{style.collection?.titleZh ?? "-"}</td>
                  <td className="px-4 py-3">{style.mainImageUrl ? "有" : "无"}</td>
                  <td className="px-4 py-3">{style.isActive ? "是" : "否"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(style)} className="rounded-full border border-[#E4B9A8] px-3 py-2 font-semibold text-[#6B3F2A]">编辑</button>
                      <Link href={`/admin/catalog/styles/${style.id}`} className="rounded-full bg-[#6B3F2A] px-3 py-2 font-semibold text-white">详情</Link>
                      <button onClick={() => toggle(style)} className="rounded-full border border-[#E4B9A8] px-3 py-2 font-semibold text-[#6B3F2A]">{style.isActive ? "停用" : "启用"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <StyleForm key={editing?.id ?? "new"} style={editing} collections={collections} message={message} action={submit} />
    </div>
  );
}

function StyleForm({
  style,
  collections,
  message,
  action,
}: {
  style: CakeStyleRow | null;
  collections: CakeCollectionRow[];
  message: string | null;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{style ? "编辑款式" : "新建款式"}</h2>
      <CollectionSelect collections={collections} defaultValue={style?.collectionId ?? ""} />
      <Input name="slug" label="Slug 标识" defaultValue={style?.slug} required />
      <Input name="nameZh" label="中文名称" defaultValue={style?.nameZh} required />
      <Input name="nameEn" label="英文名称" defaultValue={style?.nameEn} required />
      <Input name="subtitleZh" label="中文副标题" defaultValue={style?.subtitleZh ?? ""} />
      <Input name="subtitleEn" label="英文副标题" defaultValue={style?.subtitleEn ?? ""} />
      <Textarea name="descriptionZh" label="中文描述" defaultValue={style?.descriptionZh ?? ""} />
      <Textarea name="descriptionEn" label="英文描述" defaultValue={style?.descriptionEn ?? ""} />
      <Input name="mainImageUrl" label="主图 URL" defaultValue={style?.mainImageUrl ?? ""} />
      <Input name="badgeZh" label="中文标签" defaultValue={style?.badgeZh ?? ""} />
      <Input name="badgeEn" label="英文标签" defaultValue={style?.badgeEn ?? ""} />
      <Input name="sortOrder" label="排序" type="number" defaultValue={style?.sortOrder ?? 0} />
      <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]">
        <input name="isActive" type="checkbox" defaultChecked={style?.isActive ?? true} /> 启用
      </label>
      <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-3 font-semibold text-white">
        <Save size={16} /> 保存
      </button>
      {message ? <p className="mt-3 text-sm text-red-600">{message}</p> : null}
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

  async function upload(file: File, action: (url: string) => Promise<void>) {
    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/admin/uploads", { method: "POST", body: formData });
    const body = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !body.url) {
      setMessage(body.error ?? "上传失败");
      return;
    }
    await action(body.url);
    window.location.reload();
  }

  async function saveBasic(formData: FormData) {
    await catalogAction(stylePayload(formData, "updateStyle", style.id));
    window.location.reload();
  }

  async function setMainImage(url: string) {
    await catalogAction({ action: "updateStyleMainImage", id: style.id, mainImageUrl: url });
  }

  async function addGallery(url: string) {
    await catalogAction({
      action: "createImage",
      styleId: style.id,
      imageUrl: url,
      imageType: "gallery",
      sortOrder: images.length + 1,
    });
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
        <div className="grid gap-4 md:grid-cols-2">
          <CollectionSelect collections={collections} defaultValue={style.collectionId ?? ""} />
          <Input name="slug" label="Slug 标识" defaultValue={style.slug} required />
          <Input name="nameZh" label="中文名称" defaultValue={style.nameZh} required />
          <Input name="nameEn" label="英文名称" defaultValue={style.nameEn} required />
          <Input name="subtitleZh" label="中文副标题" defaultValue={style.subtitleZh ?? ""} />
          <Input name="subtitleEn" label="英文副标题" defaultValue={style.subtitleEn ?? ""} />
          <Input name="badgeZh" label="中文标签" defaultValue={style.badgeZh ?? ""} />
          <Input name="badgeEn" label="英文标签" defaultValue={style.badgeEn ?? ""} />
          <Input name="mainImageUrl" label="主图 URL" defaultValue={style.mainImageUrl ?? ""} />
          <Input name="sortOrder" label="排序" type="number" defaultValue={style.sortOrder} />
        </div>
        <Textarea name="descriptionZh" label="中文描述" defaultValue={style.descriptionZh ?? ""} />
        <Textarea name="descriptionEn" label="英文描述" defaultValue={style.descriptionEn ?? ""} />
        <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]">
          <input name="isActive" type="checkbox" defaultChecked={style.isActive} /> 启用
        </label>
        <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#6B3F2A] px-5 py-3 font-semibold text-white">
          <Save size={16} /> 保存基础信息
        </button>
      </form>

      <section className="grid gap-6 lg:grid-cols-2">
        <UploadPanel title="主图" imageUrl={style.mainImageUrl} onFile={(file) => upload(file, setMainImage)} />
        <UploadPanel title="图库图片" onFile={(file) => upload(file, addGallery)} />
      </section>

      <EditableImages styleId={style.id} images={images} />
      <EditableSections styleId={style.id} sections={sections} />
      <EditableSizes styleId={style.id} sizes={sizes} />
    </div>
  );
}

function EditableImages({ styleId, images }: { styleId: string; images: CakeStyleImageRow[] }) {
  async function save(formData: FormData, image?: CakeStyleImageRow) {
    await catalogAction({
      action: image ? "updateImage" : "createImage",
      id: image?.id,
      styleId,
      imageUrl: stringValue(formData, "imageUrl"),
      altZh: stringValue(formData, "altZh"),
      altEn: stringValue(formData, "altEn"),
      imageType: stringValue(formData, "imageType") || "gallery",
      sortOrder: numberValue(formData, "sortOrder"),
    });
    window.location.reload();
  }
  async function remove(id: string) {
    await catalogAction({ action: "deleteImage", id });
    window.location.reload();
  }
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">图库图片信息</h2>
      <div className="mt-4 space-y-4">
        {[...images, null].map((image, index) => (
          <form key={image?.id ?? "new-image"} action={(formData) => save(formData, image ?? undefined)} className="grid gap-3 rounded-xl border border-[#FFE8DC] p-3 md:grid-cols-[1fr_1fr_90px_120px]">
            <Input name="imageUrl" label="图片 URL" defaultValue={image?.imageUrl ?? ""} required={Boolean(image)} />
            <Input name="altZh" label="中文替代文字" defaultValue={image?.altZh ?? ""} />
            <Input name="sortOrder" label="排序" type="number" defaultValue={image?.sortOrder ?? index + 1} />
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#6B3F2A]">图片类型</span>
              <select name="imageType" defaultValue={image?.imageType ?? "gallery"} className="input">
                <option value="main">主图</option><option value="gallery">图库</option><option value="detail">详情图</option>
              </select>
            </label>
            <Input name="altEn" label="英文替代文字" defaultValue={image?.altEn ?? ""} />
            <div className="flex items-end gap-2 md:col-span-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-3 font-semibold text-white"><Save size={16} /> 保存</button>
              {image ? <button type="button" onClick={() => remove(image.id)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-3 font-semibold text-red-700"><Trash2 size={16} /> 删除</button> : null}
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}

function EditableSections({ styleId, sections }: { styleId: string; sections: CakeStyleSectionRow[] }) {
  async function save(formData: FormData, section?: CakeStyleSectionRow) {
    await catalogAction({
      action: section ? "updateSection" : "createSection",
      id: section?.id,
      styleId,
      sectionKey: stringValue(formData, "sectionKey"),
      titleZh: stringValue(formData, "titleZh"),
      titleEn: stringValue(formData, "titleEn"),
      bodyZh: stringValue(formData, "bodyZh"),
      bodyEn: stringValue(formData, "bodyEn"),
      sortOrder: numberValue(formData, "sortOrder"),
      isActive: formData.get("isActive") === "on",
    });
    window.location.reload();
  }
  async function remove(id: string) {
    await catalogAction({ action: "deleteSection", id });
    window.location.reload();
  }
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">详情区块</h2>
      <div className="mt-4 space-y-4">
        {[...sections, null].map((section, index) => (
          <form key={section?.id ?? "new-section"} action={(formData) => save(formData, section ?? undefined)} className="rounded-xl border border-[#FFE8DC] p-3">
            <div className="grid gap-3 md:grid-cols-4">
              <Input name="sectionKey" label="区块标识" defaultValue={section?.sectionKey ?? ""} required={Boolean(section)} />
              <Input name="titleZh" label="中文标题" defaultValue={section?.titleZh ?? ""} required={Boolean(section)} />
              <Input name="titleEn" label="英文标题" defaultValue={section?.titleEn ?? ""} required={Boolean(section)} />
              <Input name="sortOrder" label="排序" type="number" defaultValue={section?.sortOrder ?? index + 1} />
            </div>
            <Textarea name="bodyZh" label="中文内容" defaultValue={section?.bodyZh ?? ""} />
            <Textarea name="bodyEn" label="英文内容" defaultValue={section?.bodyEn ?? ""} />
            <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]"><input name="isActive" type="checkbox" defaultChecked={section?.isActive ?? true} /> 启用</label>
            <div className="mt-3 flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-3 font-semibold text-white"><Save size={16} /> 保存</button>
              {section ? <button type="button" onClick={() => remove(section.id)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-3 font-semibold text-red-700"><Trash2 size={16} /> 删除</button> : null}
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}

function EditableSizes({ styleId, sizes }: { styleId: string; sizes: CakeSizeOptionRow[] }) {
  async function save(formData: FormData, size?: CakeSizeOptionRow) {
    await catalogAction({
      action: size ? "updateSize" : "createSize",
      id: size?.id,
      styleId,
      sizeLabel: stringValue(formData, "sizeLabel"),
      servingsZh: stringValue(formData, "servingsZh"),
      servingsEn: stringValue(formData, "servingsEn"),
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
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">尺寸与价格</h2>
      <div className="mt-4 space-y-4">
        {[...sizes, null].map((size, index) => (
          <form key={size?.id ?? "new-size"} action={(formData) => save(formData, size ?? undefined)} className="grid gap-3 rounded-xl border border-[#FFE8DC] p-3 md:grid-cols-5">
            <Input name="sizeLabel" label="尺寸" defaultValue={size?.sizeLabel ?? ""} required={Boolean(size)} />
            <Input name="servingsZh" label="中文份量说明" defaultValue={size?.servingsZh ?? ""} />
            <Input name="servingsEn" label="英文份量说明" defaultValue={size?.servingsEn ?? ""} />
            <Input name="price" label="价格" type="number" defaultValue={size?.price ?? 77} />
            <Input name="sortOrder" label="排序" type="number" defaultValue={size?.sortOrder ?? index + 1} />
            <label className="flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]"><input name="isDefault" type="checkbox" defaultChecked={size?.isDefault ?? false} /> 默认</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#6B3F2A]"><input name="isActive" type="checkbox" defaultChecked={size?.isActive ?? true} /> 启用</label>
            <div className="flex gap-2 md:col-span-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-3 font-semibold text-white"><Save size={16} /> 保存</button>
              {size ? <button type="button" onClick={() => remove(size.id)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-3 font-semibold text-red-700"><Trash2 size={16} /> 删除</button> : null}
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}

function UploadPanel({ title, imageUrl, onFile }: { title: string; imageUrl?: string | null; onFile: (file: File) => void }) {
  return (
    <section className="rounded-2xl bg-[#FFFCF7] p-5 shadow-sm">
      <h2 className="text-xl font-semibold">{title}</h2>
      {imageUrl ? <img src={imageUrl} alt="" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" /> : <div className="mt-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-[#FFF7EC] text-[#7A6258]">暂无图片</div>}
      <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#6B3F2A] px-4 py-3 font-semibold text-white">
        <ImagePlus size={16} /> 上传图片
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
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
  return {
    action,
    id,
    slug: stringValue(formData, "slug"),
    titleZh: stringValue(formData, "titleZh"),
    titleEn: stringValue(formData, "titleEn"),
    descriptionZh: stringValue(formData, "descriptionZh"),
    descriptionEn: stringValue(formData, "descriptionEn"),
    type: stringValue(formData, "type"),
    coverImageUrl: stringValue(formData, "coverImageUrl"),
    sortOrder: numberValue(formData, "sortOrder"),
    isActive: formData.get("isActive") === "on",
  };
}

function stylePayload(formData: FormData, action: string, id?: string) {
  return {
    action,
    id,
    collectionId: stringValue(formData, "collectionId"),
    slug: stringValue(formData, "slug"),
    nameZh: stringValue(formData, "nameZh"),
    nameEn: stringValue(formData, "nameEn"),
    subtitleZh: stringValue(formData, "subtitleZh"),
    subtitleEn: stringValue(formData, "subtitleEn"),
    descriptionZh: stringValue(formData, "descriptionZh"),
    descriptionEn: stringValue(formData, "descriptionEn"),
    mainImageUrl: stringValue(formData, "mainImageUrl"),
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

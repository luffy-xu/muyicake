"use client";

import { ArrowLeft, Check, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PublicCollection, PublicSizeOption, PublicStyleDetail, PublicStyleSummary } from "@/lib/catalog";
import type { Locale, getDictionary } from "@/lib/i18n";

export type SelectedCakeStyle = {
  selectedCollectionId: string;
  selectedStyleId: string;
  selectedStyleName: string;
  selectedSizeOptionId: string;
  selectedSizeLabel: string;
  selectedPrice: number;
};

export function CakeStyleDrawer({
  open,
  locale,
  collectionTypes,
  dictionary,
  onClose,
  onSelect,
}: {
  open: boolean;
  locale: Locale;
  collectionTypes: Array<"qixi" | "birthday" | "custom">;
  dictionary: ReturnType<typeof getDictionary>;
  onClose: () => void;
  onSelect: (selection: SelectedCakeStyle) => void;
}) {
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const [styles, setStyles] = useState<PublicStyleSummary[]>([]);
  const [activeStyleId, setActiveStyleId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PublicStyleDetail | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    fetch(`/api/catalog/collections?locale=${locale}&type=${collectionTypes.join(",")}`)
      .then((response) => response.json() as Promise<{ collections: PublicCollection[] }>)
      .then(async (payload) => {
        setCollections(payload.collections);
        const styleGroups = await Promise.all(
          payload.collections.map((collection) =>
            fetch(`/api/catalog/styles?locale=${locale}&collectionSlug=${collection.slug}`)
              .then((response) => response.json() as Promise<{ styles: PublicStyleSummary[] }>)
              .then((stylePayload) => stylePayload.styles),
          ),
        );
        setStyles(styleGroups.flat());
      })
      .catch(() => {
        setCollections([]);
        setStyles([]);
      });
  }, [collectionTypes, locale, open]);

  useEffect(() => {
    if (!activeStyleId) {
      return;
    }
    fetch(`/api/catalog/styles/${activeStyleId}?locale=${locale}`)
      .then((response) => response.json() as Promise<{ style: PublicStyleDetail }>)
      .then((payload) => {
        setDetail(payload.style);
        setSelectedSizeId(payload.style.sizeOptions.find((size) => size.isDefault)?.id ?? payload.style.sizeOptions[0]?.id ?? "");
      });
  }, [activeStyleId, locale]);

  const selectedSize = useMemo(
    () => detail?.sizeOptions.find((size) => size.id === selectedSizeId) ?? detail?.sizeOptions[0],
    [detail, selectedSizeId],
  );

  function selectCurrentStyle() {
    if (!detail || !selectedSize) {
      return;
    }
    onSelect({
      selectedCollectionId: detail.collectionId ?? "",
      selectedStyleId: detail.id,
      selectedStyleName: detail.name,
      selectedSizeOptionId: selectedSize.id,
      selectedSizeLabel: selectedSize.sizeLabel,
      selectedPrice: selectedSize.price,
    });
    onClose();
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close cake style drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-black/35 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside className={`absolute bottom-0 right-0 flex h-[92vh] w-full flex-col overflow-hidden rounded-t-[1.5rem] bg-[#FFFCF7] shadow-2xl transition-transform md:top-0 md:h-full md:max-w-2xl md:rounded-none ${open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"}`}>
        <header className="flex items-center justify-between border-b border-[#FFE8DC] p-4">
          <div className="flex items-center gap-3">
            {activeStyleId ? (
              <button onClick={() => { setActiveStyleId(null); setDetail(null); }} className="rounded-full bg-[#FFF7EC] p-2 text-[#6B3F2A]" aria-label="Back to style list">
                <ArrowLeft size={18} />
              </button>
            ) : null}
            <div>
              <p className="text-sm font-semibold text-[#D8A95D]">{dictionary.catalog.drawerEyebrow}</p>
              <h2 className="text-xl font-semibold">{dictionary.catalog.drawerTitle}</h2>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full bg-[#FFF7EC] p-2 text-[#6B3F2A]" aria-label="Close">
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {!activeStyleId ? (
            <CakeStyleList collections={collections} styles={styles} dictionary={dictionary} onOpenStyle={setActiveStyleId} />
          ) : detail ? (
            <CakeStyleDetail
              detail={detail}
              selectedSizeId={selectedSizeId}
              dictionary={dictionary}
              onSelectSize={setSelectedSizeId}
            />
          ) : null}
        </div>

        {detail ? (
          <footer className="border-t border-[#FFE8DC] bg-[#FFFCF7] p-4">
            <button
              onClick={selectCurrentStyle}
              disabled={!selectedSize}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#E97796] px-5 py-3 font-semibold text-white disabled:opacity-50"
            >
              <Check size={18} />
              {dictionary.catalog.selectThisCake}
            </button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}

export function CakeStyleList({
  collections,
  styles,
  dictionary,
  onOpenStyle,
}: {
  collections: PublicCollection[];
  styles: PublicStyleSummary[];
  dictionary: ReturnType<typeof getDictionary>;
  onOpenStyle: (id: string) => void;
}) {
  if (!collections.length || !styles.length) {
    return <p className="rounded-2xl bg-[#FFF7EC] p-4 text-sm leading-6 text-[#7A6258]">{dictionary.catalog.empty}</p>;
  }

  return (
    <div className="space-y-6">
      {collections.map((collection) => {
        const collectionStyles = styles.filter((style) => style.collectionSlug === collection.slug);
        if (!collectionStyles.length) {
          return null;
        }
        return (
          <section key={collection.id}>
            <h3 className="text-lg font-semibold">{collection.title}</h3>
            {collection.description ? <p className="mt-1 text-sm leading-6 text-[#7A6258]">{collection.description}</p> : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {collectionStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onOpenStyle(style.id)}
                  className="overflow-hidden rounded-2xl border border-[#FFE8DC] bg-white text-left shadow-sm"
                >
                  <ImageBlock src={style.mainImageUrl} alt={style.name} />
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold">{style.name}</h4>
                      {style.badge ? <span className="rounded-full bg-[#FFF1E8] px-2 py-1 text-xs font-semibold text-[#A06A55]">{style.badge}</span> : null}
                    </div>
                    {style.subtitle ? <p className="mt-1 text-sm leading-5 text-[#7A6258]">{style.subtitle}</p> : null}
                    <p className="mt-2 font-semibold text-[#E97796]">
                      {style.startingPrice ? `${dictionary.catalog.fromPrice} S$${style.startingPrice}` : dictionary.catalog.pricePending}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function CakeStyleDetail({
  detail,
  selectedSizeId,
  dictionary,
  onSelectSize,
}: {
  detail: PublicStyleDetail;
  selectedSizeId: string;
  dictionary: ReturnType<typeof getDictionary>;
  onSelectSize: (id: string) => void;
}) {
  const images = detail.galleryImages.length ? detail.galleryImages : detail.mainImageUrl ? [{ id: detail.id, imageUrl: detail.mainImageUrl, alt: detail.name, imageType: "main" }] : [];
  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image) => (
          <div key={image.id} className="w-64 shrink-0 overflow-hidden rounded-2xl border border-[#FFE8DC]">
            <ImageBlock src={image.imageUrl} alt={image.alt ?? detail.name} />
          </div>
        ))}
      </div>
      <h3 className="mt-4 text-2xl font-semibold">{detail.name}</h3>
      {detail.description ? <p className="mt-3 leading-7 text-[#7A6258]">{detail.description}</p> : null}
      {detail.sections.length ? (
        <div className="mt-5 space-y-3">
          {detail.sections.map((section) => (
            <section key={section.id} className="rounded-2xl bg-[#FFF7EC] p-4">
              <h4 className="font-semibold">{section.title}</h4>
              {section.body ? <p className="mt-2 text-sm leading-6 text-[#7A6258]">{section.body}</p> : null}
            </section>
          ))}
        </div>
      ) : null}
      <CakeSizeSelector sizes={detail.sizeOptions} selectedSizeId={selectedSizeId} dictionary={dictionary} onSelectSize={onSelectSize} />
    </div>
  );
}

export function CakeSizeSelector({
  sizes,
  selectedSizeId,
  dictionary,
  onSelectSize,
}: {
  sizes: PublicSizeOption[];
  selectedSizeId: string;
  dictionary: ReturnType<typeof getDictionary>;
  onSelectSize: (id: string) => void;
}) {
  return (
    <section className="mt-5">
      <h4 className="font-semibold">{dictionary.catalog.chooseSize}</h4>
      <div className="mt-3 grid gap-2">
        {sizes.map((size) => (
          <button
            key={size.id}
            type="button"
            onClick={() => onSelectSize(size.id)}
            className={`rounded-2xl border p-4 text-left ${selectedSizeId === size.id ? "border-[#E97796] bg-[#FFF1F5]" : "border-[#FFE8DC] bg-white"}`}
          >
            <span className="font-semibold">{size.sizeLabel}</span>
            {size.servings ? <span className="ml-2 text-sm text-[#7A6258]">{size.servings}</span> : null}
            <span className="float-right font-semibold text-[#E97796]">S${size.price}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ImageBlock({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return <div className="flex aspect-[4/3] items-center justify-center bg-[#FFF7EC] text-sm text-[#7A6258]">Cake photo</div>;
  }
  return <img src={src} alt={alt} className="aspect-[4/3] w-full object-cover" />;
}

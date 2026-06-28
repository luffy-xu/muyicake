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
  initialSizeLabel,
  dictionary,
  onClose,
  onSelect,
}: {
  open: boolean;
  locale: Locale;
  collectionTypes: Array<"qixi" | "birthday" | "custom">;
  initialSizeLabel?: string;
  dictionary: ReturnType<typeof getDictionary>;
  onClose: () => void;
  onSelect: (selection: SelectedCakeStyle) => void;
}) {
  const [collections, setCollections] = useState<PublicCollection[]>([]);
  const [styles, setStyles] = useState<PublicStyleSummary[]>([]);
  const [listFetched, setListFetched] = useState(false);
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
      })
      .finally(() => setListFetched(true));
  }, [collectionTypes, locale, open]);

  useEffect(() => {
    if (!activeStyleId) {
      return;
    }
    fetch(`/api/catalog/styles/${activeStyleId}?locale=${locale}`)
      .then((response) => response.json() as Promise<{ style: PublicStyleDetail }>)
      .then((payload) => {
        setDetail(payload.style);
        setSelectedSizeId(resolveInitialSizeId(payload.style.sizeOptions, initialSizeLabel));
      });
  }, [activeStyleId, initialSizeLabel, locale]);

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

  const isListLoading = open && !listFetched;
  const isDetailLoading = activeStyleId !== null && (detail === null || detail.id !== activeStyleId);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close cake style drawer"
        onClick={onClose}
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute bottom-0 right-0 flex h-[92vh] w-full flex-col overflow-hidden rounded-t-[1.5rem] bg-[#FFFCF7] shadow-2xl transition-transform md:top-0 md:h-full md:max-w-2xl md:rounded-none ${
          open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0"
        }`}
      >
        <header className="flex items-center justify-between border-b border-[#FFE8DC] px-4 py-3.5">
          <div className="flex items-center gap-3">
            {activeStyleId ? (
              <button
                onClick={() => { setActiveStyleId(null); setDetail(null); }}
                className="rounded-full bg-[#FFF7EC] p-2 text-[#6B3F2A] hover:bg-[#FFE8DC]"
                aria-label="Back to style list"
              >
                <ArrowLeft size={18} />
              </button>
            ) : null}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#D8A95D]">
                {dictionary.catalog.drawerEyebrow}
              </p>
              <h2 className="text-lg font-semibold text-[#2B1E1A]">{dictionary.catalog.drawerTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-[#FFF7EC] p-2 text-[#6B3F2A] hover:bg-[#FFE8DC]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {!activeStyleId ? (
            isListLoading ? (
              <ListSkeleton />
            ) : (
              <CakeStyleList
                collections={collections}
                styles={styles}
                dictionary={dictionary}
                onOpenStyle={setActiveStyleId}
              />
            )
          ) : isDetailLoading ? (
            <DetailSkeleton />
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#E97796] px-5 py-3.5 font-semibold text-white shadow-md shadow-[#E97796]/20 disabled:opacity-50"
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

function resolveInitialSizeId(sizes: PublicSizeOption[], initialSizeLabel?: string) {
  if (!sizes.length) {
    return "";
  }
  const normalizedInitialSizeLabel = normalizeSizeLabel(initialSizeLabel);
  if (normalizedInitialSizeLabel) {
    return sizes.find((size) => normalizeSizeLabel(size.sizeLabel) === normalizedInitialSizeLabel)?.id ?? sizes[0].id;
  }
  return sizes.find((size) => size.isDefault)?.id ?? sizes[0].id;
}

function normalizeSizeLabel(label?: string) {
  return label?.replace(/\s+/g, "").replace(/寸/g, '"').toLowerCase();
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
    return (
      <div className="rounded-2xl border border-[#FFE8DC] bg-[#FFF7EC] p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE8DC]">
          <span className="text-2xl" role="img" aria-label="cake">🎂</span>
        </div>
        <p className="text-sm leading-6 text-[#7A6258]">{dictionary.catalog.empty}</p>
      </div>
    );
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
            <h3 className="text-base font-semibold text-[#2B1E1A]">{collection.title}</h3>
            {collection.description ? (
              <p className="mt-1 text-sm leading-5 text-[#7A6258]">{collection.description}</p>
            ) : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {collectionStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => onOpenStyle(style.id)}
                  className="overflow-hidden rounded-2xl border border-[#FFE8DC] bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#F7B6C8] hover:shadow-md hover:shadow-[#E97796]/10"
                >
                  <ImageBlock src={style.mainImageUrl} alt={style.name} />
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-[#2B1E1A]">{style.name}</h4>
                      {style.badge ? (
                        <span className="shrink-0 rounded-full bg-[#D8A95D] px-2 py-0.5 text-xs font-semibold text-white">
                          {style.badge}
                        </span>
                      ) : null}
                    </div>
                    {style.subtitle ? (
                      <p className="mt-1 text-xs leading-5 text-[#7A6258]">{style.subtitle}</p>
                    ) : null}
                    <p className="mt-2 font-semibold text-[#E97796]">
                      {style.startingPrice
                        ? `${dictionary.catalog.fromPrice} S$${style.startingPrice}`
                        : dictionary.catalog.pricePending}
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
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [prevDetailId, setPrevDetailId] = useState(detail.id);

  if (prevDetailId !== detail.id) {
    setPrevDetailId(detail.id);
    setActiveImgIdx(0);
  }

  const images =
    detail.galleryImages.length
      ? detail.galleryImages
      : detail.mainImageUrl
        ? [{ id: detail.id, imageUrl: detail.mainImageUrl, alt: detail.name, imageType: "main" as const }]
        : [];

  const activeImage = images[activeImgIdx] ?? images[0];

  return (
    <div>
      {/* Main image */}
      {images.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[#FFE8DC] shadow-sm">
          <ImageBlock src={activeImage?.imageUrl} alt={activeImage?.alt ?? detail.name} />
        </div>
      ) : null}

      {/* Thumbnail strip */}
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, idx) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveImgIdx(idx)}
              className={`w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                idx === activeImgIdx ? "border-[#E97796]" : "border-[#FFE8DC] hover:border-[#F7B6C8]"
              }`}
            >
              <ImageBlock src={image.imageUrl} alt={image.alt ?? detail.name} />
            </button>
          ))}
        </div>
      ) : null}

      <h3 className="mt-4 text-2xl font-semibold text-[#2B1E1A]">{detail.name}</h3>
      {detail.description ? (
        <p className="mt-2 leading-7 text-[#7A6258]">{detail.description}</p>
      ) : null}

      {detail.sections.length ? (
        <div className="mt-4 space-y-3">
          {detail.sections.map((section) => (
            <section key={section.id} className="rounded-2xl border border-[#FFE8DC] bg-[#FFF7EC] p-4">
              <h4 className="font-semibold text-[#2B1E1A]">{section.title}</h4>
              {section.body ? (
                <p className="mt-1.5 text-sm leading-6 text-[#7A6258]">{section.body}</p>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}

      <CakeSizeSelector
        sizes={detail.sizeOptions}
        selectedSizeId={selectedSizeId}
        dictionary={dictionary}
        onSelectSize={onSelectSize}
      />
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
      <h4 className="font-semibold text-[#2B1E1A]">{dictionary.catalog.chooseSize}</h4>
      <div className="mt-3 grid gap-2">
        {sizes.map((size) => {
          const isSelected = selectedSizeId === size.id;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onSelectSize(size.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? "border-[#E97796] bg-[#FFF0F4] shadow-sm shadow-[#E97796]/15"
                  : "border-[#FFE8DC] bg-white hover:border-[#F7B6C8]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-[#2B1E1A]">{size.sizeLabel}</span>
                  {size.servings ? (
                    <span className="ml-2 text-sm text-[#7A6258]">{size.servings}</span>
                  ) : null}
                </div>
                <span className={`font-semibold ${isSelected ? "text-[#E97796]" : "text-[#7A6258]"}`}>
                  S${size.price}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ImageBlock({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="brand-gradient flex aspect-[4/3] items-center justify-center">
        <span className="text-3xl opacity-30" role="img" aria-label="cake">🎂</span>
      </div>
    );
  }
  return <img src={src} alt={alt} className="aspect-[4/3] w-full object-cover" />;
}

function ListSkeleton() {
  return (
    <div className="space-y-6">
      {[0, 1].map((i) => (
        <div key={i}>
          <div className="mb-3 h-5 w-32 animate-pulse rounded-lg bg-[#FFE8DC]" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((j) => (
              <div key={j} className="overflow-hidden rounded-2xl border border-[#FFE8DC]">
                <div className="aspect-[4/3] animate-pulse bg-[#FFE8DC]" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-[#FFE8DC]" />
                  <div className="h-3 w-1/2 animate-pulse rounded-lg bg-[#FFE8DC]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[#FFE8DC]" />
      <div className="h-7 w-2/3 animate-pulse rounded-xl bg-[#FFE8DC]" />
      <div className="space-y-2">
        <div className="h-4 animate-pulse rounded-lg bg-[#FFE8DC]" />
        <div className="h-4 w-5/6 animate-pulse rounded-lg bg-[#FFE8DC]" />
      </div>
    </div>
  );
}

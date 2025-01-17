'use client';

import clsx from 'clsx';
import { addItem } from 'components/cart/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

import LoadingDots from 'components/loading-dots';
import { VercelProductVariant as ProductVariant } from 'lib/bigcommerce/types';
import { useCookies } from 'react-cookie';

const isBigCommerceAPI = true;

export function AddToCart({
  variants,
  availableForSale
}: {
  variants: ProductVariant[];
  availableForSale: boolean;
}) {
  const productEntityId = variants[0]?.parentId;
  const varianEntitytId = variants[0]?.id;
  const [selectedVariantId, setSelectedVariantId] = useState(varianEntitytId);
  const [selectedProductId, setSelectedProductId] = useState(productEntityId);
  const [,setCookie] = useCookies(['cartId']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const variant = variants.find((variant: ProductVariant) =>
      variant.selectedOptions.every(
        (option) => option.value === searchParams.get(option.name.toLowerCase())
      )
    );

    if (variant) {
      setSelectedVariantId(variant.id);
      setSelectedProductId(variant.parentId);
    }
  }, [searchParams, variants, setSelectedVariantId]);

  return (
    <button
      aria-label="Add item to cart"
      disabled={isPending}
      onClick={() => {
        if (!availableForSale) return;
        startTransition(async () => {
          const response = await addItem(isBigCommerceAPI, selectedProductId!, selectedVariantId);

          if (typeof response !== 'string') {
            alert(response);
            return;
          }

          setCookie('cartId', response, {
            path: '/',
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
          });

          router.refresh();
        });
      }}
      className={clsx(
        'flex w-full items-center justify-center bg-black p-4 text-sm uppercase tracking-wide text-white opacity-90 hover:opacity-100 dark:bg-white dark:text-black',
        {
          'cursor-not-allowed opacity-60': !availableForSale,
          'cursor-not-allowed': isPending
        }
      )}
    >
      <span>{availableForSale ? 'Add To Cart' : 'Out Of Stock'}</span>
      {isPending ? <LoadingDots className="bg-white dark:bg-black" /> : null}
    </button>
  );
}

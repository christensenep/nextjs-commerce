'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { addItem } from 'components/cart/actions';

import LoadingDots from 'components/loading-dots';
import { VercelProductVariant as ProductVariant } from 'lib/bigcommerce/types';
import { useCookies } from 'react-cookie';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

const isBigCommerceAPI = true;

export function AddToCart({
  variants,
  availableForSale
}: {
  variants: ProductVariant[];
  availableForSale: boolean;
}) {
  const [, setCookie] = useCookies(['cartId']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const defaultVariantId = variants.length === 1 ? variants[0]?.id : undefined;
  const defaultProductId = variants.length === 1 ? variants[0]?.parentId : undefined;
  const variant = variants.find((variant: ProductVariant) =>
    variant.selectedOptions.every(
      (option) => option.value === searchParams.get(option.name.toLowerCase())
    )
  );
  const selectedVariantId = variant?.id || defaultVariantId;
  const selectedProductId = variant?.parentId || defaultProductId;
  const title = !availableForSale
    ? 'Out of stock'
    : !selectedVariantId
    ? 'Please select options'
    : undefined;

  return (
    <button
      aria-label="Add item to cart"
      disabled={isPending || !availableForSale || !selectedVariantId}
      title={title}
      onClick={() => {
        if (!availableForSale || !selectedVariantId) return;
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
        'relative flex w-full items-center justify-center rounded-full bg-blue-600 p-4 tracking-wide text-white hover:opacity-90',
        {
          'cursor-not-allowed opacity-60 hover:opacity-60': !availableForSale || !selectedVariantId,
          'cursor-not-allowed': isPending
        }
      )}
    >
      <div className="absolute left-0 ml-4">
        {!isPending ? <PlusIcon className="h-5" /> : <LoadingDots className="mb-3 bg-white" />}
      </div>
      <span>{availableForSale ? 'Add To Cart' : 'Out Of Stock'}</span>
    </button>
  );
}
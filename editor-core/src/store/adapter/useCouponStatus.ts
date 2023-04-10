import { couponStatusAction, useAppDispatch, useAppSelector } from '@/store';

export function getCouponStatus() {
  const dispatch = useAppDispatch();
  // const { couponStatus: state } = useAppSelector(store => ({
  //   couponStatus: store.couponStatus,
  // }));

  function updateCouponStatus(couponStatus: any) {
    if (couponStatus) {
      dispatch(couponStatusAction.getCouponStatus(couponStatus));
    }
  }

  return updateCouponStatus;
}

export function useCouponStatus() {
  const { couponStatus } = useAppSelector(store => ({
    couponStatus: store.couponStatus,
  }));

  const updateCouponStatus = getCouponStatus();

  return { couponStatus, updateCouponStatus };
}

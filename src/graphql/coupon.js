import { gql } from "@apollo/client"

const DEPOSIT = gql`
    mutation depositCoupon($couponId: ID!) {
        depositCoupon(couponId: $couponId) {
            status,
        code,
        message
        }
    }  
`

const FIND_COUPONS = gql`
    query findCoupons($couponInputs: CouponInputs!) {
        findCoupons(couponInputs: $couponInputs) {
            message
            total
            data {
                _id,
                value,
                updatedAt
            }
        }
    }
`

export {
    DEPOSIT,
    FIND_COUPONS
}
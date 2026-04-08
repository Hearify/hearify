from repository.base import BaseRepository
from schemas.subscription_schemas import SubscriptionDB


class SubscriptionsRepository(BaseRepository):

    async def get_by_id(self, subscription_id: str) -> SubscriptionDB | None:

        collection = self.database.get_collection('subscriptions')
        subscription = await collection.find_one({'paddle_subscription_id': subscription_id})

        if subscription:
            subscription['id'] = str(subscription.pop('_id'))
            return SubscriptionDB(**subscription)
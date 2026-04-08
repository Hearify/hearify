class TrackingAPI {
  public static userId: string | null = null;

  // TODO(Sasha): Fix types for dataLayer.push
  public static trackEvent = (event: string, params: object): void => {
    if (!window.dataLayer) return;

    window.dataLayer.push({
      event,
      ...params,
      ...(TrackingAPI.userId ? { user_id: TrackingAPI.userId } : {}),
    });
  };
}

export default TrackingAPI;

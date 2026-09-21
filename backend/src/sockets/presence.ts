const onlineUser = new Map<string, number>();

export function trackConnect(userId: string): number {
    onlineUser.set(userId, (onlineUser.get(userId) ?? 0) + 1);
    return onlineUser.size;
}


export function trackDisconnect(userId: string): number {
    const count = onlineUser.get(userId);

    if(count === undefined){
        return onlineUser.size;
    }

    if(count <= 1) {
        onlineUser.delete(userId);
    } else {
        onlineUser.set(userId, count - 1);
    }

    return onlineUser.size;
}

export function getOnlineCount(): number {
  return onlineUser.size;
}

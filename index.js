class Observable {
    constructor(subscribe) {
        this._subscribe = subscribe;
    }

    subscribe(observer) {
        return this._subscribe(observer);
    }

    static timeout(time) {
        return new Observable(function subscribe(observer) {
            const handle = setTimeout(function () {
                observer.next();
                observer.complete();
            }, time);
            return {
                unsubscribe() {
                    clearTimeout(handle)
                }
            }
        });
    }

    static fromEvent(dom, eventName) {
        return new Observable(function subscribe(observer) {
            const handler = (ev) => {
                observer.next(ev);
            };

            dom.addEventListener(eventName, handler);

            return {
                unsubscribe() {
                    dom.removeEventListener(eventName, handler)
                }
            }
        })
    }

    map(projection) {
        const subscribe = (observer) => {
            const subscription = this.subscribe({
                next(v) {
                    let value;
                    try {
                        value = projection(v);
                        observer.next(value);
                    } catch (e) {
                        observer.error(e)
                    }
                },
                error(err) {
                    observer.error(err);
                    subscription.unsubscribe();
                },
                complete() {
                    observer.complete();
                }
            });
            return subscription;
        };

        return new Observable(subscribe)
    }

    filter(predicate) {
        const subscribe = (observer) => {
            const subscription = this.subscribe({
                next(v) {
                    if (predicate(v)) {
                        observer.next(v);
                    }
                },
                error(err) {
                    observer.error(err);
                    subscription.unsubscribe();
                },
                complete() {
                    observer.complete();
                }
            });
            return subscription;
        };

        return new Observable(subscribe)
    }
}

const obs = Observable.timeout(500);
obs.subscribe({
    next(v) {
        console.log('next')
    },
    complete() {
        console.log('done')
    }
});

const button = document.getElementById('button');
const click$ = Observable.fromEvent(button, 'click');

click$.map(ev => ev.offsetX)
    .filter(offsetX => offsetX > 10)
    .subscribe({
        next(ev) {
            console.log(ev)
        },
        complete() {
            console.log('done')
        }
    });
package com.bugsnag.reactnative;

import java.util.Map;

interface ReadableMapDeserializer<T> {
    T deserialize(Map<String, Object> map);
}

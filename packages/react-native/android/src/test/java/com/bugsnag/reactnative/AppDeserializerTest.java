package com.bugsnag.reactnative;

import static org.junit.Assert.assertEquals;

import com.bugsnag.android.AppWithState;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.HashMap;
import java.util.Map;

@RunWith(MockitoJUnitRunner.class)
public class AppDeserializerTest {

    private HashMap<String, Object> map = new HashMap<>();

    /**
     * Generates an AppWithState for verifying the serializer
     */
    @Before
    public void setup() {
        AppWithState app = new AppWithState(TestData.generateConfig(),
                "x86", "com.example.foo", "prod",
                "1.5.3", 509, 23, true
        );
        map.put("duration", app.getDuration());
        map.put("durationInForeground", app.getDurationInForeground());
        map.put("inForeground", app.getInForeground());
        map.put("binaryArch", app.getBinaryArch());
        map.put("buildUuid", app.getBuildUuid());
        map.put("codeBundleId", app.getCodeBundleId());
        map.put("id", app.getId());
        map.put("releaseStage", app.getReleaseStage());
        map.put("appType", app.getType());
        map.put("version", app.getVersion());
        map.put("versionCode", app.getVersionCode());
    }

    @Test
    public void serialize() {
        AppWithState app = new AppDeserializer().deserialize(map);
        assertEquals(509, app.getDuration());
        assertEquals(23, app.getDurationInForeground());
        assertEquals(true, app.getInForeground());
        assertEquals("x86", app.getBinaryArch());
        assertEquals("builduuid-123", app.getBuildUuid());
        assertEquals("code-id-123", app.getCodeBundleId());
        assertEquals("com.example.foo", app.getId());
        assertEquals("prod", app.getReleaseStage());
        assertEquals("android", app.getType());
        assertEquals("1.5.3", app.getVersion());
        assertEquals(55, app.getVersionCode());
    }
}

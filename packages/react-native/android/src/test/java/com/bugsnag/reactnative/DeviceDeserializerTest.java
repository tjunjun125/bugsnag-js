package com.bugsnag.reactnative;

import com.bugsnag.android.DeviceWithState;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertEquals;

@RunWith(MockitoJUnitRunner.class)
public class DeviceDeserializerTest {

    private HashMap<String, Object> map = new HashMap<>();

    /**
     * Generates an AppWithState for verifying the serializer
     */
    @Before
    public void setup() {
        map.put("cpuAbi", new String[]{"x86"});
        map.put("jailbroken", true);
        map.put("id", "fa02");
        map.put("locale", "yue");
        map.put("manufacturer", "google");
        map.put("model", "pixel4");
        map.put("osName", "android");
        map.put("osVersion", "8.0");
        map.put("totalMemory", 50923409234L);
        map.put("freeDisk", 20923423434L);
        map.put("freeMemory", 23409662345L);
        map.put("orientation", "portrait");
        map.put("time", DateUtils.toIso8601(new Date(0)));

        Map<String, Object> runtimeVersions = new HashMap<>();
        runtimeVersions.put("androidApiLevel", 27);
        runtimeVersions.put("osBuild", "bulldog");
        map.put("runtimeVersions", runtimeVersions);
    }

    @Test
    public void serialize() {
        DeviceWithState device = new DeviceDeserializer().deserialize(map);
        assertEquals(Arrays.asList("x86"), device.getCpuAbi());
        assertEquals(true, device.getJailbroken());
        assertEquals("fa02", device.getId());
        assertEquals("yue", device.getLocale());
        assertEquals("google", device.getManufacturer());
        assertEquals("pixel4", device.getModel());
        assertEquals("android", device.getOsName());
        assertEquals("8.0", device.getOsVersion());
        assertEquals(50923409234L, (long) device.getTotalMemory());
        assertEquals(20923423434L, (long) device.getFreeDisk());
        assertEquals(23409662345L, (long) device.getFreeMemory());
        assertEquals("portrait", device.getOrientation());
        assertEquals(new Date(0), device.getTime());

        Map<String, Object> runtimeVersions = new HashMap<>();
        runtimeVersions.put("androidApiLevel", 27);
        runtimeVersions.put("osBuild", "bulldog");
        assertEquals(runtimeVersions, device.getRuntimeVersions());
    }
}

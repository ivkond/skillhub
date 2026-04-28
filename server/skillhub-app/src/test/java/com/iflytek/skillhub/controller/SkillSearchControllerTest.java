package com.iflytek.skillhub.controller;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.iflytek.skillhub.domain.namespace.NamespaceMemberRepository;
import com.iflytek.skillhub.service.SkillSearchAppService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SkillSearchControllerTest {

    private final Logger logger = (Logger) LoggerFactory.getLogger(
            com.iflytek.skillhub.controller.portal.SkillSearchController.class
    );
    private ListAppender<ILoggingEvent> appender;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NamespaceMemberRepository namespaceMemberRepository;

    @MockBean
    private SkillSearchAppService skillSearchAppService;

    @AfterEach
    void tearDown() {
        if (appender != null) {
            logger.detachAppender(appender);
            appender.stop();
        }
    }

    @Test
    void searchShouldUseUnifiedEnvelopeAndItemsField() throws Exception {
        when(skillSearchAppService.search(
                eq("review"),
                eq("global"),
                eq("newest"),
                eq(0),
                eq(20),
                eq(null),
                any(),
                any()))
                .thenReturn(new SkillSearchAppService.SearchResponse(List.of(), 0, 0, 20));

        mockMvc.perform(get("/api/web/skills")
                        .param("q", "review")
                        .param("namespace", "global"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.total").value(0))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.requestId").isNotEmpty());
    }

    @Test
    void searchShouldPassExplicitSortPageAndSize() throws Exception {
        when(skillSearchAppService.search(
                eq(null),
                eq(null),
                eq("newest"),
                eq(0),
                eq(12),
                eq(null),
                any(),
                any()))
                .thenReturn(new SkillSearchAppService.SearchResponse(List.of(), 0, 0, 12));

        mockMvc.perform(get("/api/web/skills")
                        .param("sort", "newest")
                        .param("page", "0")
                        .param("size", "12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.size").value(12))
                .andExpect(jsonPath("$.data.page").value(0));
    }

    @Test
    void searchShouldPassLabelFilters() throws Exception {
        when(skillSearchAppService.search(
                eq("review"),
                eq(null),
                eq("newest"),
                eq(0),
                eq(20),
                eq(List.of("code-generation", "official")),
                any(),
                any()))
                .thenReturn(new SkillSearchAppService.SearchResponse(List.of(), 0, 0, 20));

        mockMvc.perform(get("/api/web/skills")
                        .param("q", "review")
                        .param("label", "code-generation")
                        .param("label", "official"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items").isArray());
    }

    @Test
    void searchShouldFallbackToDefaultsForBlankQueryParams() throws Exception {
        when(skillSearchAppService.search(
                eq(null),
                eq(null),
                eq("newest"),
                eq(0),
                eq(20),
                eq(null),
                any(),
                any()))
                .thenReturn(new SkillSearchAppService.SearchResponse(List.of(), 0, 0, 20));

        mockMvc.perform(get("/api/web/skills")
                        .param("sort", " ")
                        .param("page", "")
                        .param("size", " "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(20));
    }

    @Test
    void searchShouldFallbackToDefaultsForInvalidPagination() throws Exception {
        attachAppender();
        when(skillSearchAppService.search(
                eq(null),
                eq(null),
                eq("newest"),
                eq(0),
                eq(20),
                eq(null),
                any(),
                any()))
                .thenReturn(new SkillSearchAppService.SearchResponse(List.of(), 0, 0, 20));

        mockMvc.perform(get("/api/web/skills")
                        .param("page", "NaN")
                        .param("size", "-12"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.size").value(20));

        assertThat(loggedMessages()).anySatisfy(message -> {
            assertThat(message).contains("Invalid pagination query parameter");
            assertThat(message).contains("page");
            assertThat(message).contains("NaN");
        });
        assertThat(loggedMessages()).anySatisfy(message -> {
            assertThat(message).contains("Invalid pagination query parameter");
            assertThat(message).contains("size");
            assertThat(message).contains("-12");
        });
    }

    private void attachAppender() {
        logger.setLevel(Level.WARN);
        appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
    }

    private java.util.List<String> loggedMessages() {
        return appender.list.stream()
                .map(ILoggingEvent::getFormattedMessage)
                .toList();
    }
}

package com.iflytek.skillhub.controller.portal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iflytek.skillhub.TestRedisConfig;
import com.iflytek.skillhub.auth.device.DeviceAuthService;
import com.iflytek.skillhub.auth.rbac.PlatformPrincipal;
import com.iflytek.skillhub.domain.collection.SkillCollection;
import com.iflytek.skillhub.domain.collection.SkillCollectionContributorService;
import com.iflytek.skillhub.domain.collection.SkillCollectionDomainService;
import com.iflytek.skillhub.domain.namespace.Namespace;
import com.iflytek.skillhub.domain.namespace.NamespaceMemberRepository;
import com.iflytek.skillhub.domain.namespace.NamespaceRepository;
import com.iflytek.skillhub.domain.skill.Skill;
import com.iflytek.skillhub.domain.skill.SkillRepository;
import com.iflytek.skillhub.domain.skill.SkillVisibility;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestRedisConfig.class)
class SkillCollectionSecurityIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SkillCollectionDomainService skillCollectionDomainService;

    @Autowired
    private SkillCollectionContributorService skillCollectionContributorService;

    @Autowired
    private NamespaceRepository namespaceRepository;

    @Autowired
    private SkillRepository skillRepository;

    @MockBean
    private NamespaceMemberRepository namespaceMemberRepository;

    @MockBean
    private DeviceAuthService deviceAuthService;

    @Test
    void contributorCannotUpdateCollectionMetadata() throws Exception {
        TestFixture fixture = createFixture();

        MvcResult result = mockMvc.perform(patch("/api/web/collections/{id}", fixture.collection().getId())
                        .with(authentication(portalAuth(fixture.contributorUserId(), "USER")))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Contributor update",
                                "description", "should fail",
                                "slug", fixture.collection().getSlug()
                        ))))
                .andReturn();

        assertContributorDenied(result);
    }

    @Test
    void contributorCannotDeleteCollection() throws Exception {
        TestFixture fixture = createFixture();

        MvcResult result = mockMvc.perform(delete("/api/web/collections/{id}", fixture.collection().getId())
                        .with(authentication(portalAuth(fixture.contributorUserId(), "USER")))
                        .with(csrf()))
                .andReturn();

        assertContributorDenied(result);
    }

    @Test
    void contributorCannotManageContributors() throws Exception {
        TestFixture fixture = createFixture();

        MvcResult result = mockMvc.perform(post("/api/web/collections/{id}/contributors", fixture.collection().getId())
                        .with(authentication(portalAuth(fixture.contributorUserId(), "USER")))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("userId", "user-c"))))
                .andReturn();

        assertContributorDenied(result);
    }

    @Test
    void contributorCanAddSkillToCollection() throws Exception {
        TestFixture fixture = createFixture();

        mockMvc.perform(post("/api/web/collections/{id}/skills", fixture.collection().getId())
                        .with(authentication(portalAuth(fixture.contributorUserId(), "USER")))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("skillId", fixture.publicSkill().getId()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.skillId").value(fixture.publicSkill().getId()));
    }

    @Test
    void ownerCanUpdateCollectionMetadata() throws Exception {
        TestFixture fixture = createFixture();

        mockMvc.perform(patch("/api/web/collections/{id}", fixture.collection().getId())
                        .with(authentication(portalAuth(fixture.ownerUserId(), "USER")))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "title", "Owner update",
                                "description", "allowed",
                                "slug", fixture.collection().getSlug()
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("Owner update"));
    }

    private void assertContributorDenied(MvcResult result) throws Exception {
        int status = result.getResponse().getStatus();
        String body = result.getResponse().getContentAsString();
        boolean deniedByStatus = status == 403;
        boolean deniedByCode = status == 400 && body.contains("contributorDenied");
        assertTrue(deniedByStatus || deniedByCode,
                () -> "Expected contributor denied status/body but got status=" + status + " body=" + body);
    }

    private TestFixture createFixture() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String ownerUserId = "owner-" + suffix;
        String contributorUserId = "contributor-" + suffix;

        SkillCollection collection = skillCollectionDomainService.createCollection(
                ownerUserId,
                "Collection " + suffix,
                "security test fixture",
                SkillVisibility.PUBLIC,
                "security-" + suffix,
                false,
                ownerUserId
        );
        skillCollectionContributorService.addContributor(collection.getId(), ownerUserId, contributorUserId, false);

        Namespace namespace = namespaceRepository.save(
                new Namespace("global-collection-" + suffix, "Global Collection " + suffix, ownerUserId)
        );
        Skill publicSkill = new Skill(namespace.getId(), "collection-skill-" + suffix, ownerUserId, SkillVisibility.PUBLIC);
        publicSkill.setDisplayName("Collection Skill " + suffix);
        publicSkill = skillRepository.save(publicSkill);

        return new TestFixture(ownerUserId, contributorUserId, collection, publicSkill);
    }

    private UsernamePasswordAuthenticationToken portalAuth(String userId, String... roles) {
        PlatformPrincipal principal = new PlatformPrincipal(
                userId,
                userId,
                userId + "@example.com",
                "",
                "session",
                Set.of(roles)
        );
        List<SimpleGrantedAuthority> authorities = java.util.Arrays.stream(roles)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .toList();
        return new UsernamePasswordAuthenticationToken(principal, null, authorities);
    }

    private record TestFixture(
            String ownerUserId,
            String contributorUserId,
            SkillCollection collection,
            Skill publicSkill
    ) {
    }
}

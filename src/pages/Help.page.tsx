import { Outlet } from 'react-router-dom';
import { Container, Stack, Text, Title } from '@mantine/core';

export function HelpPage() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="md">
        <Title order={2}>Need a hand?</Title>
        <Text c="dimmed">
          This is a placeholder help page. Add FAQs, contact details, or links to documentation here
          when you are ready.
        </Text>
      </Stack>
    </Container>
  );
}

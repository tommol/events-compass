import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const PREDEFINED_TAGS = [
  { slug: 'party', label: 'Party' },
  { slug: 'club-night', label: 'Club Night' },
  { slug: 'festival', label: 'Festival' },
  { slug: 'social', label: 'Social Gathering' },
  { slug: 'meetup', label: 'Meetup' },
  { slug: 'workshop', label: 'Workshop' },
  { slug: 'performance', label: 'Performance / Show' },

  { slug: 'lgbtq', label: 'LGBTQ+' },
  { slug: 'gay', label: 'Gay' },
  { slug: 'lesbian', label: 'Lesbian' },
  { slug: 'bi', label: 'Bisexual' },
  { slug: 'trans', label: 'Trans / Non-binary' },
  { slug: 'queer', label: 'Queer' },
  { slug: 'women-only', label: 'Women Only' },
  { slug: 'men-only', label: 'Men Only' },
  { slug: 'mixed', label: 'Mixed / Open' },

  { slug: 'fetish', label: 'Fetish' },
  { slug: 'bdsm', label: 'BDSM' },
  { slug: 'leather', label: 'Leather' },
  { slug: 'rubber', label: 'Rubber / Latex' },
  { slug: 'puppy', label: 'Puppy Play' },
  { slug: 'gear', label: 'Gear / Dresscode' },
  { slug: 'uniform', label: 'Uniform' },
  { slug: 'sportswear', label: 'Sportswear' },

  { slug: 'techno', label: 'Techno' },
  { slug: 'house', label: 'House' },
  { slug: 'electronic', label: 'Electronic' },
  { slug: 'pop', label: 'Pop' },
  { slug: 'drag', label: 'Drag' },

  { slug: 'dance', label: 'Dance' },
  { slug: 'play-party', label: 'Play Party' },
  { slug: 'cruising', label: 'Cruising' },
  { slug: 'workshop-kink', label: 'Kink Workshop' },
  { slug: 'discussion', label: 'Discussion / Talk' },

  { slug: 'sex-positive', label: 'Sex-positive' },
  { slug: 'safe-space', label: 'Safe Space' },
  { slug: 'consent-focused', label: 'Consent-focused' },
  { slug: 'beginner-friendly', label: 'Beginner Friendly' },
  { slug: 'experienced', label: 'Experienced Only' },

  { slug: 'dresscode', label: 'Dresscode Required' },
  { slug: 'nude-friendly', label: 'Nude Friendly' },
  { slug: 'underwear', label: 'Underwear' },
  { slug: 'leather-dresscode', label: 'Leather Dresscode' },

  { slug: 'club', label: 'Club' },
  { slug: 'bar', label: 'Bar' },
  { slug: 'private', label: 'Private Venue' },
  { slug: 'outdoor', label: 'Outdoor' },

  { slug: 'nightlife', label: 'Nightlife' },
  { slug: 'afterparty', label: 'Afterparty' },
  { slug: 'daytime', label: 'Daytime Event' },
];

async function main() {
  await prisma.user.upsert({
    where: { email: 'demo@eventscompass.dev' },
    update: {},
    create: {
      email: 'demo@eventscompass.dev',
      name: 'Demo User',
    },
  });

  for (const tag of PREDEFINED_TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { label: tag.label },
      create: tag,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

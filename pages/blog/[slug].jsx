
import { useRouter } from 'next/router';
import Image from 'next/image';

import Layout from '@/components/Layout';

const apiPath = 'https://react.webworker.berlin/wp-json/wp/v2/';
const graphQlPath = 'https://react.webworker.berlin/graphql/';

/* Wenn man einen dynamischen Pfad hat, muss man Next mitteilen,
welche Pfade das System statisch generieren soll, hier also
eine Liste der vorhanden Blog-Slugs übergeben. */
export async function getStaticPaths() {
  let paths = [];

  try {
    const query = `{
      posts{
        nodes{
          slug
        }
      }
    }`;

    const response = await fetch(`${graphQlPath}?query=${query}`);

    const posts = await response.json();

    /*    Die Einträge im paths-Array müssen den params entsprechen,
      die getStaticProps erhält. */
    paths = posts.data.posts.nodes.map(({ slug }) => ({ params: { slug } }));
  } catch (e) {
    console.log(e);
  }

  /* fallback legt fest, dass ein neuer und noch nicht in paths
  enthaltene Slug frisch von WordPress geholt werden soll.
  Wenn man für paths einen leeren Array zurückgibt, werden
  also alle Blogbeiträge erst statisch generiert, wenn sie
  zum ersten Mal angefordert werden. Man könnte in paths
  auch nur z.B. die 20 neuesten Blogbeiträge übergeben. */

  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  let post = {};

  const query=`{
    post(id: "react-rockt", idType: SLUG) {
    title
    content
    featuredImage {
      node {
        altText
        guid
        mediaDetails {
          height
          width
        }
      }
    }
    }
  }`;
  
  try {
    const response = await fetch(`${apiPath}posts?slug=${params.slug}`);
    //Anfrage gibt einen Array mit einem Eintrag, nicht den einzelnen Post zurück
    const responseObject = await response.json();

    post = responseObject.data.post;

    /* // In der Antwort ist nur die ID des Titelbildes enthalten,
    // nicht die Daten zum Bild selbst, deshalb ist hier eine zweite Anfrage nötig.
    if (post.featured_media) {
      post.titleImage = await getTitleImage(post.featured_media);
    } */
  } catch (error) {
    console.log(error);
  }

  return {
    props: {
      post,
    },
    revalidate: 3600,
  };
}

/* async function getTitleImage(imageId) {
  try {
    const response = await fetch(`${apiPath}media/${imageId}`);
    const imageData = await response.json();

    return {
      src: imageData.guid.rendered,
      width: imageData.media_details.width,
      height: imageData.media_details.height,
      alt: imageData.alt_text,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
} */

export default function BlogPost({ post }) {
  // https://nextjs.org/docs/basic-features/data-fetching#fallback-pages
  const router = useRouter();
  if (router.isFallback) {
    return <strong>Laden...</strong>;
  }

  const { title, content, featuredImage } = post;

  return (
    <Layout title={title}>
      {featuredImage && (
        <Image
          src={featuredImage.node.guid}
          alt={featuredImage.node.altText}
          width={featuredImage.node.mediaDetails.width}
          height={featuredImage.node.mediaDetails.height}
          layout="responsive"
          sizes="(max-width: 50rem) 100vw, 50rem"
        />
      )}

      <div dangerouslySetInnerHTML={{ __html: content }} />
    </Layout>
  );
}
